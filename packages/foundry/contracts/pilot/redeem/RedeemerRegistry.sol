// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title RedeemerRegistry — Admin-gated redeemer authorization and offer catalog.
/// @notice Manages the directory of authorized redeemers and their offerings.
///
///         Pilot upgrades from demo:
///         - MCE acceptance flag per redeemer (acceptsMCE) — gates MCE-specific offers.
///         - mceOnly flag per offer — marks offers available only via MCE credits.
///         - updateOffer() for price adjustments without recreate.
///         - Redeemer classification tier (per Redeemer Classification Framework).
///         - metadataURI per redeemer for off-chain profile data.
///         - Paginated redeemer listing to prevent unbounded gas.
contract RedeemerRegistry is AccessControl, Pausable {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    /// @notice Redeemer Classification Tier.
    enum Tier { Green, Yellow, Red }

    struct RedeemerProfile {
        string metadataURI;     // IPFS CID: name, logo, description, location, contact
        Tier tier;
        bool authorized;
        bool paused;
        bool acceptsMCE;        // true = this redeemer accepts MCE-context redemptions
    }

    struct Offer {
        string name;
        uint256 costCity;       // price in CityToken (18 decimals)
        bool active;
        bool mceOnly;           // true = only redeemable in MCE context
    }

    mapping(address => RedeemerProfile) public profiles;

    address[] public allRedeemers;
    mapping(address => bool) public isKnownRedeemer;

    mapping(address => uint256) public nextOfferId;
    mapping(address => mapping(uint256 => Offer)) public offers;

    // ---- Events ----

    event RedeemerSet(address indexed redeemer, bool authorized);
    event RedeemerProfileUpdated(address indexed redeemer, string metadataURI, Tier tier);
    event RedeemerPaused(address indexed redeemer, bool paused);
    event RedeemerMCEToggled(address indexed redeemer, bool acceptsMCE);

    event OfferCreated(
        address indexed redeemer,
        uint256 indexed offerId,
        string name,
        uint256 costCity,
        bool mceOnly
    );
    event OfferUpdated(address indexed redeemer, uint256 indexed offerId, uint256 newCostCity);
    event OfferStatusSet(address indexed redeemer, uint256 indexed offerId, bool active);

    // ---- Errors ----

    error NotAuthorizedRedeemer();
    error BadOffer();

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    // ================================================================
    // ADMIN — Redeemer Authorization
    // ================================================================

    /// @notice Authorize or deauthorize a redeemer. Only CITY_ADMIN.
    function setRedeemer(address redeemer, bool authorized) external onlyRole(CITY_ADMIN_ROLE) {
        require(redeemer != address(0), "zero address");
        profiles[redeemer].authorized = authorized;
        if (authorized && !isKnownRedeemer[redeemer]) {
            isKnownRedeemer[redeemer] = true;
            allRedeemers.push(redeemer);
        }
        emit RedeemerSet(redeemer, authorized);
    }

    /// @notice Set redeemer profile metadata and classification tier.
    function setRedeemerProfile(
        address redeemer,
        string calldata metadataURI,
        Tier tier
    ) external onlyRole(CITY_ADMIN_ROLE) {
        require(isKnownRedeemer[redeemer], "unknown redeemer");
        profiles[redeemer].metadataURI = metadataURI;
        profiles[redeemer].tier = tier;
        emit RedeemerProfileUpdated(redeemer, metadataURI, tier);
    }

    /// @notice Pause/unpause an individual redeemer (emergency stop).
    function setRedeemerPaused(address redeemer, bool paused_) external onlyRole(CITY_ADMIN_ROLE) {
        profiles[redeemer].paused = paused_;
        emit RedeemerPaused(redeemer, paused_);
    }

    // ================================================================
    // REDEEMER — Self-service MCE toggle and offer management
    // ================================================================

    /// @notice Toggle whether this redeemer accepts MCE-context redemptions.
    ///         Callable by the redeemer or CITY_ADMIN.
    function setAcceptsMCE(bool accepts) external whenNotPaused {
        _requireActiveRedeemer(msg.sender);
        profiles[msg.sender].acceptsMCE = accepts;
        emit RedeemerMCEToggled(msg.sender, accepts);
    }

    /// @notice Admin override to set MCE acceptance for any redeemer.
    function setAcceptsMCEAdmin(address redeemer, bool accepts) external onlyRole(CITY_ADMIN_ROLE) {
        profiles[redeemer].acceptsMCE = accepts;
        emit RedeemerMCEToggled(redeemer, accepts);
    }

    /// @notice Create a new offering. Callable only by authorized, unpaused redeemers.
    function createOffer(
        string calldata name,
        uint256 costCity,
        bool mceOnly
    ) external whenNotPaused returns (uint256 offerId) {
        _requireActiveRedeemer(msg.sender);
        require(costCity > 0, "cost=0");

        // If mceOnly, redeemer must accept MCE credits
        if (mceOnly) {
            require(profiles[msg.sender].acceptsMCE, "MCE not accepted");
        }

        offerId = ++nextOfferId[msg.sender];
        offers[msg.sender][offerId] = Offer({
            name: name,
            costCity: costCity,
            active: true,
            mceOnly: mceOnly
        });

        emit OfferCreated(msg.sender, offerId, name, costCity, mceOnly);
    }

    /// @notice Update the price of an existing offer. Does not change name or mceOnly flag.
    function updateOffer(uint256 offerId, uint256 newCostCity) external whenNotPaused {
        _requireActiveRedeemer(msg.sender);
        require(newCostCity > 0, "cost=0");

        Offer storage o = offers[msg.sender][offerId];
        if (bytes(o.name).length == 0) revert BadOffer();

        o.costCity = newCostCity;

        emit OfferUpdated(msg.sender, offerId, newCostCity);
    }

    /// @notice Activate or deactivate an offer.
    function setOfferActive(uint256 offerId, bool active) external whenNotPaused {
        _requireActiveRedeemer(msg.sender);

        Offer storage o = offers[msg.sender][offerId];
        if (bytes(o.name).length == 0) revert BadOffer();

        o.active = active;
        emit OfferStatusSet(msg.sender, offerId, active);
    }

    // ================================================================
    // INTERNAL
    // ================================================================

    function _requireActiveRedeemer(address redeemer) internal view {
        if (!profiles[redeemer].authorized || profiles[redeemer].paused) {
            revert NotAuthorizedRedeemer();
        }
    }

    // ================================================================
    // VIEWS
    // ================================================================

    function canRedeem(address redeemer) external view returns (bool) {
        return !paused()
            && profiles[redeemer].authorized
            && !profiles[redeemer].paused;
    }

    function getOffer(address redeemer, uint256 offerId) external view returns (Offer memory) {
        return offers[redeemer][offerId];
    }

    function getProfile(address redeemer) external view returns (RedeemerProfile memory) {
        return profiles[redeemer];
    }

    function redeemerCount() external view returns (uint256) {
        return allRedeemers.length;
    }

    /// @notice Paginated redeemer list to avoid unbounded gas.
    function getRedeemers(uint256 offset, uint256 limit) external view returns (address[] memory result) {
        uint256 total = allRedeemers.length;
        if (offset >= total) return new address[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = allRedeemers[i];
        }
    }

    // ================================================================
    // PAUSE
    // ================================================================

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
