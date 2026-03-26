// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import { CityToken } from "../token/CityToken.sol";
import { RedeemerRegistry } from "./RedeemerRegistry.sol";
import { RedemptionReceipt } from "./RedemptionReceipt.sol";
import { IRedemptionPolicy } from "../interfaces/IRedemptionPolicy.sol";

/// @title Redemption — Unified redemption engine for CitySync Pilot.
/// @notice Handles all redemption paths (standard city offers + MCE-specific offers)
///         through a single contract. Replaces DemoCityRedemption and MCERedemption.
///
///         Two redemption flows:
///         1. Direct purchase: citizen calls purchaseOffer() → CITY burned → receipt minted.
///         2. Two-step consent: citizen requestRedemption() → redeemer finalizeRedemption().
///
///         MCE offer handling: if an offer has mceOnly=true, the redeemer must have
///         acceptsMCE=true in their RedeemerRegistry profile. The Redemption contract
///         enforces this check on purchaseOffer().
///
/// @dev All CITY burns go through CityToken.burnFrom() which requires BURNER_ROLE.
///      All receipt mints go through RedemptionReceipt.mintTo() which requires MINTER_ROLE.
contract Redemption is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    CityToken public immutable CITY;
    RedeemerRegistry public immutable REGISTRY;
    RedemptionReceipt public immutable RECEIPT;

    mapping(address => uint256) public lastReceiptId;

    /// @notice Per-citizen usage counts per offering.
    mapping(address citizen => mapping(address redeemer => mapping(uint256 offerId => uint256)))
        public offerUsesByCitizen;

    /// @notice Aggregate usage counts per offering.
    mapping(address redeemer => mapping(uint256 offerId => uint256))
        public offerUsesTotal;

    /// @notice Optional anti-abuse/caps policy hook. address(0) = no policy.
    IRedemptionPolicy public policy;

    struct RedemptionRequest {
        address citizen;
        address redeemer;
        uint256 amount;
        bytes32 memoHash;
        bool finalized;
    }

    mapping(address => uint256) public nonces;
    mapping(bytes32 => RedemptionRequest) public requests;

    // ---- Events ----

    event RedemptionRequested(
        bytes32 indexed requestId,
        address indexed citizen,
        address indexed redeemer,
        uint256 amount,
        bytes32 memoHash
    );

    event RedemptionFinalized(
        bytes32 indexed requestId,
        address indexed citizen,
        address indexed redeemer,
        uint256 amount,
        bytes32 refHash
    );

    event OfferPurchased(
        address indexed citizen,
        address indexed redeemer,
        uint256 indexed offerId,
        uint256 costCity,
        uint256 receiptId,
        bool mceOffer
    );

    event PolicySet(address indexed policy);

    // ---- Errors ----

    error NotAuthorizedRedeemer();
    error InvalidRequest();
    error AlreadyFinalized();
    error MCENotAccepted();
    error InactiveOffer();

    constructor(
        address admin,
        CityToken city,
        RedeemerRegistry registry,
        RedemptionReceipt receipt
    ) {
        CITY = city;
        REGISTRY = registry;
        RECEIPT = receipt;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    // ================================================================
    // ADMIN
    // ================================================================

    function setPolicy(address policy_) external onlyRole(CITY_ADMIN_ROLE) {
        policy = IRedemptionPolicy(policy_);
        emit PolicySet(policy_);
    }

    // ================================================================
    // TWO-STEP CONSENT FLOW
    // ================================================================

    /// @notice Citizen creates a redemption request. This is the consent step.
    function requestRedemption(address redeemer, uint256 amount, bytes32 memoHash)
        external
        whenNotPaused
        nonReentrant
        returns (bytes32 requestId)
    {
        if (!REGISTRY.canRedeem(redeemer)) revert NotAuthorizedRedeemer();
        require(amount > 0, "amount=0");

        if (address(policy) != address(0)) {
            require(policy.canRequestRedemption(msg.sender, redeemer, amount), "policy reject");
        }

        uint256 nonce = nonces[msg.sender]++;
        requestId = keccak256(
            abi.encodePacked(block.chainid, address(this), msg.sender, redeemer, amount, memoHash, nonce)
        );

        RedemptionRequest storage r = requests[requestId];
        require(r.citizen == address(0), "exists");

        r.citizen = msg.sender;
        r.redeemer = redeemer;
        r.amount = amount;
        r.memoHash = memoHash;
        r.finalized = false;

        emit RedemptionRequested(requestId, msg.sender, redeemer, amount, memoHash);
    }

    /// @notice Authorized redeemer finalizes a redemption. Burns CITY from citizen.
    function finalizeRedemption(bytes32 requestId, bytes32 refHash)
        external
        whenNotPaused
        nonReentrant
    {
        if (!REGISTRY.canRedeem(msg.sender)) revert NotAuthorizedRedeemer();

        RedemptionRequest storage r = requests[requestId];
        if (r.citizen == address(0)) revert InvalidRequest();
        if (r.finalized) revert AlreadyFinalized();
        require(r.redeemer == msg.sender, "wrong redeemer");

        if (address(policy) != address(0)) {
            require(policy.canFinalizeRedemption(requestId, msg.sender), "policy reject");
        }

        r.finalized = true;
        CITY.burnFrom(r.citizen, r.amount);

        emit RedemptionFinalized(requestId, r.citizen, msg.sender, r.amount, refHash);
    }

    // ================================================================
    // DIRECT OFFER PURCHASE
    // ================================================================

    /// @notice Citizen directly purchases a redeemer's offering.
    ///         Burns CITY immediately and mints a non-transferable receipt NFT.
    ///         If the offer is mceOnly, validates that the redeemer accepts MCE credits.
    function purchaseOffer(address redeemer, uint256 offerId)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 receiptId)
    {
        if (!REGISTRY.canRedeem(redeemer)) revert NotAuthorizedRedeemer();

        RedeemerRegistry.Offer memory offer = REGISTRY.getOffer(redeemer, offerId);
        if (!offer.active) revert InactiveOffer();
        require(offer.costCity > 0, "bad offer");

        // MCE-only offer validation
        if (offer.mceOnly) {
            RedeemerRegistry.RedeemerProfile memory profile = REGISTRY.getProfile(redeemer);
            if (!profile.acceptsMCE) revert MCENotAccepted();
        }

        // Burn CITY from purchaser
        CITY.burnFrom(msg.sender, offer.costCity);

        // Mint receipt
        receiptId = RECEIPT.mintTo(msg.sender, redeemer, offerId, offer.costCity);
        lastReceiptId[msg.sender] = receiptId;

        offerUsesByCitizen[msg.sender][redeemer][offerId] += 1;
        offerUsesTotal[redeemer][offerId] += 1;

        emit OfferPurchased(msg.sender, redeemer, offerId, offer.costCity, receiptId, offer.mceOnly);
    }

    // ================================================================
    // PAUSE
    // ================================================================

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
