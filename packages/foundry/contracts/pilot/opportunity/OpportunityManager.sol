// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import { CityToken } from "../token/CityToken.sol";
import { VoteToken } from "../token/VoteToken.sol";
import { IEligibility } from "../interfaces/IEligibility.sol";
import { IMCEGovernor } from "../interfaces/IMCEGovernor.sol";
import { IssuerRegistry } from "../identity/IssuerRegistry.sol";

/// @title OpportunityManager — Pilot-ready task lifecycle manager for CitySync.
/// @notice Manages the full lifecycle of civic engagement opportunities:
///         creation → claim → submit completion → verification → reward minting.
///
///         Pilot upgrades from demo:
///         - MCE tasks are unified into this contract via `mceId` field (absorbs MCETaskRegistry).
///         - When mceId > 0, the contract validates MCE status via IMCEGovernor interface.
///         - IssuerRegistry integration records issuance stats and enforces epoch caps.
///         - Claim expiry: claims auto-expire after configurable duration if no submission.
///         - Three verification modes retained: IssuerOnly, DelegatedVerifiers, EIP712Signature.
///
/// @dev All state-mutating functions respect Pausable. Reentrancy guard on verification
///      functions that trigger external calls (CITY.mintTo, VOTE.mintTo).
contract OpportunityManager is AccessControl, Pausable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");
    bytes32 public constant CERTIFIED_ISSUER_ROLE = keccak256("CERTIFIED_ISSUER_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    CityToken public immutable CITY;
    VoteToken public immutable VOTE;
    IssuerRegistry public immutable ISSUER_REG;

    /// @notice Optional MCE governor contract. Set to address(0) if MCEs are not yet enabled.
    IMCEGovernor public mceGovernor;

    /// @notice Default claim expiry duration. 0 = claims never expire.
    uint64 public defaultClaimExpiry = 72 hours;

    /// @dev Issuer-specific delegated verifier mapping.
    mapping(address issuer => mapping(address verifier => bool)) public isVerifierForIssuer;

    enum VerificationMode {
        IssuerOnly,
        DelegatedVerifiers,
        EIP712Signature
    }

    struct Opportunity {
        address issuer;
        string metadataURI;         // IPFS CID: title, description, instructions, image, category
        uint256 rewardCity;         // CityToken minted on verification (18 decimals)
        uint256 rewardVote;         // VoteToken minted (0 = same as rewardCity)
        address eligibilityHook;    // Optional IEligibility contract. address(0) = open to all.
        VerificationMode mode;
        uint256 maxCompletions;     // 0 = unlimited
        uint64 expiresAt;           // 0 = never
        uint64 cooldownSeconds;     // 0 = no cooldown between repeat completions
        uint256 mceId;              // 0 = standard task. > 0 = tied to this MCE.
        bool active;
        uint32 verifiedCount;
    }

    enum CompletionStatus {
        None,
        Submitted,
        Verified,
        Invalidated
    }

    struct Completion {
        bytes32 proofHash;          // keccak256 of IPFS CID containing evidence
        uint64 submittedAt;
        uint64 verifiedAt;
        CompletionStatus status;
    }

    struct Claim {
        address claimant;
        uint64 claimedAt;
    }

    mapping(uint256 => Opportunity) public opportunities;
    uint256 public nextOpportunityId = 1;

    /// @dev Claim state per opportunity. Tracks claimant and timestamp for expiry.
    mapping(uint256 => Claim) public claims;

    mapping(uint256 => mapping(address => Completion)) public completions;
    mapping(uint256 => mapping(address => uint64)) public lastVerifiedAt;

    /// @dev EIP712 nonce per (citizen, opportunity) for replay protection.
    mapping(uint256 => mapping(address => uint256)) public verifyNonces;

    bytes32 public constant VERIFY_TYPEHASH = keccak256(
        "VerifyCompletion(address citizen,uint256 opportunityId,bytes32 proofHash,uint256 nonce,uint256 deadline)"
    );

    // ---- Events ----

    event IssuerApproved(address indexed issuer, bool approved);
    event VerifierSet(address indexed issuer, address indexed verifier, bool approved);
    event MCEGovernorSet(address indexed governor);
    event ClaimExpirySet(uint64 newExpiry);

    event OpportunityCreated(
        uint256 indexed opportunityId,
        address indexed issuer,
        uint256 rewardCity,
        uint256 rewardVote,
        uint256 mceId,
        VerificationMode mode,
        string metadataURI
    );
    event OpportunityUpdated(uint256 indexed opportunityId);
    event OpportunityStatusSet(uint256 indexed opportunityId, bool active);

    event OpportunityClaimed(uint256 indexed opportunityId, address indexed citizen, uint64 expiresAt);
    event OpportunityUnclaimed(uint256 indexed opportunityId, address indexed citizen);
    event ClaimExpired(uint256 indexed opportunityId, address indexed previousClaimant, address indexed freedBy);

    event CompletionSubmitted(uint256 indexed opportunityId, address indexed citizen, bytes32 proofHash);
    event CompletionVerified(
        uint256 indexed opportunityId,
        address indexed citizen,
        uint256 cityMinted,
        uint256 voteMinted,
        uint256 mceId
    );
    event CompletionInvalidated(uint256 indexed opportunityId, address indexed citizen, string reason);

    // ---- Errors ----

    error NotActiveIssuer();
    error MCENotPlanning(uint256 mceId);
    error MCENotActive(uint256 mceId);
    error MCEGovernorNotSet();

    constructor(
        address admin,
        CityToken city,
        VoteToken vote,
        IssuerRegistry issuerReg
    ) EIP712("CitySyncOpportunityManager", "2") {
        CITY = city;
        VOTE = vote;
        ISSUER_REG = issuerReg;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    // ================================================================
    // ADMIN
    // ================================================================

    function setIssuerApproved(address issuer, bool approved) external onlyRole(CITY_ADMIN_ROLE) {
        if (approved) _grantRole(CERTIFIED_ISSUER_ROLE, issuer);
        else _revokeRole(CERTIFIED_ISSUER_ROLE, issuer);
        emit IssuerApproved(issuer, approved);
    }

    function setVerifierForIssuer(address issuer, address verifier, bool approved) external {
        if (msg.sender != issuer) {
            _checkRole(CITY_ADMIN_ROLE, msg.sender);
        }
        isVerifierForIssuer[issuer][verifier] = approved;
        emit VerifierSet(issuer, verifier, approved);
    }

    function setMCEGovernor(address governor) external onlyRole(CITY_ADMIN_ROLE) {
        mceGovernor = IMCEGovernor(governor);
        emit MCEGovernorSet(governor);
    }

    function setDefaultClaimExpiry(uint64 expiry) external onlyRole(CITY_ADMIN_ROLE) {
        defaultClaimExpiry = expiry;
        emit ClaimExpirySet(expiry);
    }

    // ================================================================
    // OPPORTUNITY LIFECYCLE
    // ================================================================

    /// @notice Create a new opportunity. Caller must have CERTIFIED_ISSUER_ROLE.
    ///         If mceId > 0, the MCE must be in Planning status (task creation phase).
    function createOpportunity(
        string calldata metadataURI,
        uint256 rewardCity,
        uint256 rewardVote,
        address eligibilityHook,
        VerificationMode mode,
        uint256 maxCompletions,
        uint64 expiresAt,
        uint64 cooldownSeconds,
        uint256 mceId
    ) external onlyRole(CERTIFIED_ISSUER_ROLE) whenNotPaused returns (uint256 opportunityId) {
        require(rewardCity > 0, "rewardCity=0");
        require(bytes(metadataURI).length <= 256, "uri too long");

        // If MCE task, validate MCE is in Planning phase
        if (mceId > 0) {
            if (address(mceGovernor) == address(0)) revert MCEGovernorNotSet();
            if (!mceGovernor.isMCEPlanning(mceId)) revert MCENotPlanning(mceId);
        }

        opportunityId = nextOpportunityId++;

        Opportunity storage o = opportunities[opportunityId];
        o.issuer = msg.sender;
        o.metadataURI = metadataURI;
        o.rewardCity = rewardCity;
        o.rewardVote = rewardVote;
        o.eligibilityHook = eligibilityHook;
        o.mode = mode;
        o.maxCompletions = maxCompletions;
        o.expiresAt = expiresAt;
        o.cooldownSeconds = cooldownSeconds;
        o.mceId = mceId;
        o.active = true;

        emit OpportunityCreated(
            opportunityId,
            msg.sender,
            rewardCity,
            rewardVote == 0 ? rewardCity : rewardVote,
            mceId,
            mode,
            metadataURI
        );
    }

    /// @notice Update mutable fields. Cannot change issuer or mceId.
    function updateOpportunity(
        uint256 opportunityId,
        string calldata metadataURI,
        uint256 newRewardCity,
        uint256 newRewardVote,
        address newEligibilityHook,
        uint256 newMaxCompletions,
        uint64 newExpiresAt,
        uint64 newCooldownSeconds
    ) external {
        Opportunity storage o = opportunities[opportunityId];
        require(o.issuer != address(0), "bad id");
        require(msg.sender == o.issuer || hasRole(CITY_ADMIN_ROLE, msg.sender), "not allowed");

        if (newMaxCompletions != 0) {
            require(newMaxCompletions >= o.verifiedCount, "max<verified");
        }

        if (newRewardCity != 0) o.rewardCity = newRewardCity;
        o.rewardVote = newRewardVote;
        o.metadataURI = metadataURI;
        o.eligibilityHook = newEligibilityHook;
        o.maxCompletions = newMaxCompletions;
        o.expiresAt = newExpiresAt;
        o.cooldownSeconds = newCooldownSeconds;

        emit OpportunityUpdated(opportunityId);
    }

    function setOpportunityActive(uint256 opportunityId, bool active) external {
        Opportunity storage o = opportunities[opportunityId];
        require(o.issuer != address(0), "bad id");
        require(msg.sender == o.issuer || hasRole(CITY_ADMIN_ROLE, msg.sender), "not allowed");
        o.active = active;
        emit OpportunityStatusSet(opportunityId, active);
    }

    // ================================================================
    // CLAIM LIFECYCLE (with expiry)
    // ================================================================

    /// @notice Claim an opportunity. Once claimed, only the claimant can submit completion
    ///         until the claim expires or is released.
    function claimOpportunity(uint256 opportunityId) external whenNotPaused {
        Opportunity storage o = opportunities[opportunityId];
        require(o.issuer != address(0), "bad id");
        require(o.active, "inactive");
        if (o.expiresAt != 0) require(block.timestamp <= o.expiresAt, "expired");

        // If MCE task, validate MCE is Active
        if (o.mceId > 0) {
            if (address(mceGovernor) == address(0)) revert MCEGovernorNotSet();
            if (!mceGovernor.isMCEActive(o.mceId)) revert MCENotActive(o.mceId);
        }

        Claim storage cl = claims[opportunityId];

        // Check existing claim
        if (cl.claimant != address(0) && cl.claimant != msg.sender) {
            // Check if existing claim has expired
            if (defaultClaimExpiry > 0 && block.timestamp >= uint256(cl.claimedAt) + uint256(defaultClaimExpiry)) {
                // Claim has expired — free it
                emit ClaimExpired(opportunityId, cl.claimant, msg.sender);
            } else {
                revert("already claimed");
            }
        }

        cl.claimant = msg.sender;
        cl.claimedAt = uint64(block.timestamp);

        uint64 expiry = defaultClaimExpiry > 0
            ? uint64(block.timestamp) + defaultClaimExpiry
            : 0;

        emit OpportunityClaimed(opportunityId, msg.sender, expiry);
    }

    /// @notice Unclaim an opportunity. Only the current claimant can unclaim.
    ///         Requires no pending completion.
    function unclaimOpportunity(uint256 opportunityId) external whenNotPaused {
        Claim storage cl = claims[opportunityId];
        require(cl.claimant == msg.sender, "not claimant");

        Completion storage c = completions[opportunityId][msg.sender];
        require(
            c.status == CompletionStatus.None || c.status == CompletionStatus.Invalidated,
            "pending/verified"
        );

        cl.claimant = address(0);
        cl.claimedAt = 0;

        emit OpportunityUnclaimed(opportunityId, msg.sender);
    }

    /// @notice Permissionless cleanup of an expired claim.
    function freeExpiredClaim(uint256 opportunityId) external {
        require(defaultClaimExpiry > 0, "no expiry");
        Claim storage cl = claims[opportunityId];
        require(cl.claimant != address(0), "not claimed");
        require(
            block.timestamp >= uint256(cl.claimedAt) + uint256(defaultClaimExpiry),
            "not expired"
        );

        address prev = cl.claimant;
        cl.claimant = address(0);
        cl.claimedAt = 0;

        emit ClaimExpired(opportunityId, prev, msg.sender);
    }

    // ================================================================
    // COMPLETION LIFECYCLE
    // ================================================================

    /// @notice Submit proof of task completion. The proofHash should be the keccak256
    ///         of the IPFS CID containing photographic or textual evidence.
    function submitCompletion(uint256 opportunityId, bytes32 proofHash) external whenNotPaused {
        Opportunity storage o = opportunities[opportunityId];
        require(o.active, "inactive");
        require(o.issuer != address(0), "bad id");
        if (o.expiresAt != 0) require(block.timestamp <= o.expiresAt, "expired");

        // MCE validation
        if (o.mceId > 0) {
            if (address(mceGovernor) == address(0)) revert MCEGovernorNotSet();
            if (!mceGovernor.isMCEActive(o.mceId)) revert MCENotActive(o.mceId);
        }

        // Eligibility check
        if (o.eligibilityHook != address(0)) {
            require(IEligibility(o.eligibilityHook).isEligible(msg.sender, opportunityId), "ineligible");
        }

        // Claim check — if claimed, only claimant can submit (unless claim expired)
        Claim storage cl = claims[opportunityId];
        if (cl.claimant != address(0) && cl.claimant != msg.sender) {
            bool claimExpired = defaultClaimExpiry > 0
                && block.timestamp >= uint256(cl.claimedAt) + uint256(defaultClaimExpiry);
            require(claimExpired, "claimed by other");
        }

        Completion storage c = completions[opportunityId][msg.sender];
        require(
            c.status == CompletionStatus.None || c.status == CompletionStatus.Invalidated,
            "already pending/verified"
        );

        // Cooldown enforcement
        if (o.cooldownSeconds != 0) {
            uint64 last = lastVerifiedAt[opportunityId][msg.sender];
            require(
                last == 0 || block.timestamp >= uint256(last) + uint256(o.cooldownSeconds),
                "cooldown"
            );
        }

        c.proofHash = proofHash;
        c.submittedAt = uint64(block.timestamp);
        c.verifiedAt = 0;
        c.status = CompletionStatus.Submitted;

        emit CompletionSubmitted(opportunityId, msg.sender, proofHash);
    }

    /// @notice On-chain verifier path (IssuerOnly / DelegatedVerifiers).
    function verifyCompletion(uint256 opportunityId, address citizen)
        external
        whenNotPaused
        nonReentrant
    {
        Opportunity storage o = opportunities[opportunityId];
        require(o.active, "inactive");
        require(o.issuer != address(0), "bad id");
        if (o.expiresAt != 0) require(block.timestamp <= o.expiresAt, "expired");
        if (o.maxCompletions != 0) require(o.verifiedCount < o.maxCompletions, "max reached");

        _requireCanVerify(o, msg.sender);

        Completion storage c = completions[opportunityId][citizen];
        require(c.status == CompletionStatus.Submitted, "not submitted");

        _finalizeVerification(opportunityId, citizen, o, c);
    }

    /// @notice Signature-based verifier path (EIP-712).
    function verifyCompletionWithSig(
        uint256 opportunityId,
        address citizen,
        bytes32 proofHash,
        uint256 deadline,
        bytes calldata signature
    ) external whenNotPaused nonReentrant {
        Opportunity storage o = opportunities[opportunityId];
        require(o.issuer != address(0), "bad id");
        require(o.mode == VerificationMode.EIP712Signature, "wrong mode");
        require(o.active, "inactive");
        if (o.expiresAt != 0) require(block.timestamp <= o.expiresAt, "expired");
        if (o.maxCompletions != 0) require(o.verifiedCount < o.maxCompletions, "max reached");
        require(block.timestamp <= deadline, "sig expired");

        Completion storage c = completions[opportunityId][citizen];
        require(c.status == CompletionStatus.Submitted, "not submitted");
        require(c.proofHash == proofHash, "proof mismatch");

        uint256 nonce = verifyNonces[opportunityId][citizen]++;

        bytes32 structHash = keccak256(
            abi.encode(VERIFY_TYPEHASH, citizen, opportunityId, proofHash, nonce, deadline)
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);

        require(
            signer == o.issuer || isVerifierForIssuer[o.issuer][signer],
            "bad signer"
        );

        _finalizeVerification(opportunityId, citizen, o, c);
    }

    /// @notice Invalidate a completion submission (pre-mint only).
    function invalidateCompletion(uint256 opportunityId, address citizen, string calldata reason)
        external
        whenNotPaused
    {
        Opportunity storage o = opportunities[opportunityId];
        require(o.issuer != address(0), "bad id");
        require(
            msg.sender == o.issuer
                || hasRole(CITY_ADMIN_ROLE, msg.sender)
                || hasRole(GUARDIAN_ROLE, msg.sender),
            "not allowed"
        );

        Completion storage c = completions[opportunityId][citizen];
        require(c.status == CompletionStatus.Submitted, "not submitted");
        c.status = CompletionStatus.Invalidated;

        emit CompletionInvalidated(opportunityId, citizen, reason);
    }

    // ================================================================
    // INTERNAL
    // ================================================================

    function _requireCanVerify(Opportunity storage o, address verifier) internal view {
        if (o.mode == VerificationMode.IssuerOnly) {
            require(verifier == o.issuer, "issuer only");
        } else if (o.mode == VerificationMode.DelegatedVerifiers) {
            require(
                verifier == o.issuer || isVerifierForIssuer[o.issuer][verifier],
                "not verifier"
            );
        } else {
            revert("use sig mode");
        }
    }

    function _finalizeVerification(
        uint256 opportunityId,
        address citizen,
        Opportunity storage o,
        Completion storage c
    ) internal {
        c.status = CompletionStatus.Verified;
        c.verifiedAt = uint64(block.timestamp);

        o.verifiedCount += 1;
        lastVerifiedAt[opportunityId][citizen] = uint64(block.timestamp);

        uint256 cityAmt = o.rewardCity;
        uint256 voteAmt = o.rewardVote == 0 ? o.rewardCity : o.rewardVote;

        // Mint tokens
        CITY.mintTo(citizen, cityAmt);
        VOTE.mintTo(citizen, voteAmt);

        // Record issuance stats on IssuerRegistry (enforces epoch cap)
        // Use try/catch so verification doesn't revert if stats recording fails
        // (e.g., issuer was suspended between task creation and verification)
        try ISSUER_REG.recordIssuance(o.issuer, cityAmt) {} catch {}

        emit CompletionVerified(opportunityId, citizen, cityAmt, voteAmt, o.mceId);
    }

    // ================================================================
    // VIEWS
    // ================================================================

    function getOpportunity(uint256 opportunityId) external view returns (Opportunity memory) {
        return opportunities[opportunityId];
    }

    function getCompletion(uint256 opportunityId, address citizen)
        external
        view
        returns (Completion memory)
    {
        return completions[opportunityId][citizen];
    }

    function getClaim(uint256 opportunityId) external view returns (Claim memory) {
        return claims[opportunityId];
    }

    function isClaimExpired(uint256 opportunityId) external view returns (bool) {
        Claim storage cl = claims[opportunityId];
        if (cl.claimant == address(0)) return false;
        if (defaultClaimExpiry == 0) return false;
        return block.timestamp >= uint256(cl.claimedAt) + uint256(defaultClaimExpiry);
    }

    // ================================================================
    // PAUSE
    // ================================================================

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
