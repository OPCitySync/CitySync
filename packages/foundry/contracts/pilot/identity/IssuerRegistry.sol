// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title IssuerRegistry — Admin-gated issuer authorization for CitySync Pilot.
/// @notice Unlike the demo's self-service registry, pilot issuers must pass off-chain
///         classification review before an admin registers them on-chain. Each issuer
///         has a risk classification tier (Green/Yellow/Red) per the Issuer Classification
///         Framework and optional per-epoch credit issuance caps.
///
/// @dev The CERTIFIED_ISSUER_ROLE is granted to active issuers and consumed by
///      OpportunityManager to gate task creation. STATS_UPDATER_ROLE is granted to
///      OpportunityManager so it can record issuance events after verification.
contract IssuerRegistry is AccessControl, Pausable {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");
    bytes32 public constant CERTIFIED_ISSUER_ROLE = keccak256("CERTIFIED_ISSUER_ROLE");
    bytes32 public constant STATS_UPDATER_ROLE = keccak256("STATS_UPDATER_ROLE");

    /// @notice Classification tier per the Issuer Classification Framework.
    ///         Green  = highest trust, broadest task creation authority.
    ///         Yellow = moderate trust, standard caps apply.
    ///         Red    = probationary or flagged, restricted caps.
    enum Tier { Green, Yellow, Red }

    struct IssuerProfile {
        string orgName;
        string metadataURI;         // IPFS CID: logo, description, contact, mission statement
        Tier tier;
        uint64 registeredAt;
        bool active;
        uint256 totalTasksIssued;
        uint256 totalCreditsIssued;
    }

    /// @notice Per-issuer per-epoch issuance cap. 0 = unlimited (admin decides per tier).
    mapping(address => uint256) public epochCap;

    /// @notice Credits issued by an issuer during the current epoch.
    ///         Reset to 0 each epoch via admin call or keeper.
    mapping(address => uint256) public epochIssuance;

    /// @notice Current epoch ID. Incremented by admin when a new epoch begins.
    uint256 public currentEpoch;

    /// @notice The epoch during which each issuer's counter was last reset.
    mapping(address => uint256) public lastResetEpoch;

    mapping(address => IssuerProfile) public profiles;
    address[] public allIssuers;

    // ---- Events ----

    event IssuerRegistered(address indexed issuer, string orgName, Tier tier);
    event IssuerProfileUpdated(address indexed issuer, string orgName, string metadataURI);
    event IssuerTierUpdated(address indexed issuer, Tier oldTier, Tier newTier);
    event IssuerSuspended(address indexed issuer, bytes32 reasonHash);
    event IssuerReinstated(address indexed issuer);
    event IssuanceRecorded(address indexed issuer, uint256 credits, uint256 totalTasks, uint256 totalCredits);
    event EpochCapSet(address indexed issuer, uint256 cap);
    event EpochAdvanced(uint256 newEpoch);

    // ---- Errors ----

    error AlreadyRegistered();
    error NotRegistered();
    error IssuerSuspendedErr();
    error EpochCapExceeded(uint256 requested, uint256 remaining);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
        currentEpoch = 1;
    }

    // ================================================================
    // ADMIN — Registration & Profile Management
    // ================================================================

    /// @notice Register a new issuer after off-chain classification review.
    ///         Only callable by CITY_ADMIN. The issuer is immediately granted
    ///         CERTIFIED_ISSUER_ROLE and marked active.
    /// @param issuer   The issuer wallet address.
    /// @param orgName  Organization name (verified off-chain).
    /// @param metadataURI  IPFS CID for extended profile data.
    /// @param tier     Classification tier assigned during review.
    function registerIssuer(
        address issuer,
        string calldata orgName,
        string calldata metadataURI,
        Tier tier
    ) external onlyRole(CITY_ADMIN_ROLE) whenNotPaused {
        if (profiles[issuer].registeredAt != 0) revert AlreadyRegistered();
        require(issuer != address(0), "zero address");

        profiles[issuer] = IssuerProfile({
            orgName: orgName,
            metadataURI: metadataURI,
            tier: tier,
            registeredAt: uint64(block.timestamp),
            active: true,
            totalTasksIssued: 0,
            totalCreditsIssued: 0
        });

        allIssuers.push(issuer);
        _grantRole(CERTIFIED_ISSUER_ROLE, issuer);

        emit IssuerRegistered(issuer, orgName, tier);
    }

    /// @notice Update mutable profile fields for an existing issuer.
    ///         Callable by CITY_ADMIN or the issuer themselves.
    function updateIssuerProfile(
        address issuer,
        string calldata orgName,
        string calldata metadataURI
    ) external whenNotPaused {
        IssuerProfile storage p = profiles[issuer];
        if (p.registeredAt == 0) revert NotRegistered();
        require(
            msg.sender == issuer || hasRole(CITY_ADMIN_ROLE, msg.sender),
            "not authorized"
        );

        p.orgName = orgName;
        p.metadataURI = metadataURI;

        emit IssuerProfileUpdated(issuer, orgName, metadataURI);
    }

    /// @notice Update an issuer's risk classification tier.
    function setIssuerTier(address issuer, Tier newTier) external onlyRole(CITY_ADMIN_ROLE) {
        IssuerProfile storage p = profiles[issuer];
        if (p.registeredAt == 0) revert NotRegistered();

        Tier oldTier = p.tier;
        p.tier = newTier;

        emit IssuerTierUpdated(issuer, oldTier, newTier);
    }

    /// @notice Suspend an issuer. Revokes CERTIFIED_ISSUER_ROLE, preventing task creation.
    /// @param reasonHash  Keccak256 hash of the suspension reason (full text stored off-chain).
    function suspendIssuer(address issuer, bytes32 reasonHash) external onlyRole(CITY_ADMIN_ROLE) {
        IssuerProfile storage p = profiles[issuer];
        if (p.registeredAt == 0) revert NotRegistered();

        p.active = false;
        _revokeRole(CERTIFIED_ISSUER_ROLE, issuer);

        emit IssuerSuspended(issuer, reasonHash);
    }

    /// @notice Reinstate a suspended issuer. Restores CERTIFIED_ISSUER_ROLE.
    function reinstateIssuer(address issuer) external onlyRole(CITY_ADMIN_ROLE) {
        IssuerProfile storage p = profiles[issuer];
        if (p.registeredAt == 0) revert NotRegistered();

        p.active = true;
        _grantRole(CERTIFIED_ISSUER_ROLE, issuer);

        emit IssuerReinstated(issuer);
    }

    // ================================================================
    // ADMIN — Epoch & Cap Management
    // ================================================================

    /// @notice Set the per-epoch credit issuance cap for an issuer.
    ///         0 = unlimited. Typically set based on tier policy:
    ///           Green:  high cap or unlimited
    ///           Yellow: moderate cap
    ///           Red:    low cap
    function setEpochCap(address issuer, uint256 cap) external onlyRole(CITY_ADMIN_ROLE) {
        if (profiles[issuer].registeredAt == 0) revert NotRegistered();
        epochCap[issuer] = cap;
        emit EpochCapSet(issuer, cap);
    }

    /// @notice Advance to the next epoch. Resets all epoch issuance counters implicitly
    ///         (counters are lazily reset on next recordIssuance via lastResetEpoch check).
    function advanceEpoch() external onlyRole(CITY_ADMIN_ROLE) {
        currentEpoch += 1;
        emit EpochAdvanced(currentEpoch);
    }

    // ================================================================
    // STATS UPDATER — Called by OpportunityManager after verification
    // ================================================================

    /// @notice Record a credit issuance event for an issuer.
    ///         Called by OpportunityManager after minting CITY to a citizen.
    ///         Enforces per-epoch cap if configured.
    function recordIssuance(address issuer, uint256 credits)
        external
        onlyRole(STATS_UPDATER_ROLE)
    {
        IssuerProfile storage p = profiles[issuer];
        if (p.registeredAt == 0) revert NotRegistered();

        // Lazy epoch reset
        if (lastResetEpoch[issuer] < currentEpoch) {
            epochIssuance[issuer] = 0;
            lastResetEpoch[issuer] = currentEpoch;
        }

        // Enforce epoch cap
        uint256 cap = epochCap[issuer];
        if (cap != 0) {
            uint256 remaining = cap > epochIssuance[issuer] ? cap - epochIssuance[issuer] : 0;
            if (credits > remaining) revert EpochCapExceeded(credits, remaining);
        }

        epochIssuance[issuer] += credits;
        p.totalTasksIssued += 1;
        p.totalCreditsIssued += credits;

        emit IssuanceRecorded(issuer, credits, p.totalTasksIssued, p.totalCreditsIssued);
    }

    // ================================================================
    // VIEWS
    // ================================================================

    function isActiveIssuer(address issuer) external view returns (bool) {
        return profiles[issuer].active && hasRole(CERTIFIED_ISSUER_ROLE, issuer);
    }

    function getProfile(address issuer) external view returns (IssuerProfile memory) {
        return profiles[issuer];
    }

    function getTier(address issuer) external view returns (Tier) {
        return profiles[issuer].tier;
    }

    function issuerCount() external view returns (uint256) {
        return allIssuers.length;
    }

    /// @notice Paginated issuer list to avoid unbounded gas on getAllIssuers.
    function getIssuers(uint256 offset, uint256 limit) external view returns (address[] memory result) {
        uint256 total = allIssuers.length;
        if (offset >= total) return new address[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = allIssuers[i];
        }
    }

    /// @notice Returns the remaining issuance capacity for the current epoch.
    function remainingEpochCapacity(address issuer) external view returns (uint256) {
        uint256 cap = epochCap[issuer];
        if (cap == 0) return type(uint256).max; // unlimited

        uint256 used = lastResetEpoch[issuer] < currentEpoch ? 0 : epochIssuance[issuer];
        return cap > used ? cap - used : 0;
    }

    // ================================================================
    // PAUSE
    // ================================================================

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
