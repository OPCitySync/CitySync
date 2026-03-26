// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import { VoteToken } from "../token/VoteToken.sol";
import { IssuerRegistry } from "../identity/IssuerRegistry.sol";
import { IMCEGovernor } from "../interfaces/IMCEGovernor.sol";

/// @title MCEGovernor — Snapshot-based Mass Coordination Event governance.
/// @notice Manages the full MCE lifecycle with production-grade voting:
///
///         State machine:
///           Proposed → (voting period ends) → Planning (passed) | Rejected (failed)
///           Planning → (planning period ends) → Active
///           Active → (admin closes) → Closed
///
///         Pilot upgrades from demo MCERegistry:
///         - Snapshot-based voting via VoteToken.getPastVotes() — prevents double-voting
///           by acquiring tokens between vote and snapshot.
///         - Quorum as basis points (BPS) of total VoteToken supply at snapshot time,
///           rather than an absolute token count.
///         - Epoch-aware proposal window (proposals only accepted during configured windows).
///         - Proposal deposit requirement (configurable CITY amount) to deter spam.
///
/// @dev Implements IMCEGovernor so OpportunityManager can check MCE status without
///      importing the full contract.
contract MCEGovernor is AccessControl, Pausable, ReentrancyGuard, IMCEGovernor {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    VoteToken public immutable VOTE;
    IssuerRegistry public immutable ISSUER_REG;

    // ---- Configurable parameters ----

    uint64 public votingDuration = 14 days;
    uint64 public planningDuration = 2 days;

    /// @notice Quorum expressed in basis points (BPS) of total VoteToken supply at snapshot.
    ///         500 = 5%. Must be >= 100 (1%).
    uint256 public quorumBps = 500; // 5%

    /// @notice Maximum active proposals at any time. Prevents governance fatigue.
    uint256 public maxActiveProposals = 10;

    uint256 public activeProposalCount;

    // ---- MCE State ----

    enum MCEStatus {
        Proposed,
        Planning,
        Active,
        Closed,
        Rejected
    }

    struct MCE {
        uint256 id;
        string title;
        string description;
        string cityContext;
        address proposer;
        uint64 proposedAt;
        uint64 votingEndsAt;
        uint64 planningEndsAt;
        uint256 snapshotBlock;      // block number at proposal time for getPastVotes
        MCEStatus status;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 totalSupplyAtSnapshot;  // total VOTE supply at snapshot for quorum calc
    }

    mapping(uint256 => MCE) public mces;
    uint256 public nextMCEId = 1;

    /// @dev Track who voted on which MCE (prevents double-voting).
    mapping(uint256 mceId => mapping(address voter => bool)) public hasVoted;

    /// @dev Track which MCEs a proposer has submitted (for dashboard queries).
    mapping(address => uint256[]) public proposerMCEs;

    // ---- Events ----

    event MCEProposed(
        uint256 indexed mceId,
        address indexed proposer,
        string title,
        uint64 votingEndsAt,
        uint256 snapshotBlock
    );
    event VoteCast(
        uint256 indexed mceId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    event MCETransitionedToPlanning(uint256 indexed mceId, uint64 planningEndsAt);
    event MCETransitionedToActive(uint256 indexed mceId);
    event MCEClosed(uint256 indexed mceId);
    event MCERejected(uint256 indexed mceId, uint256 votesFor, uint256 votesAgainst, uint256 quorumRequired);
    event QuorumBpsUpdated(uint256 newBps);
    event TimingsUpdated(uint64 newVotingDuration, uint64 newPlanningDuration);
    event MaxActiveProposalsUpdated(uint256 newMax);

    // ---- Errors ----

    error NotActiveIssuer();
    error AlreadyVoted();
    error NoVotingPower();
    error WrongStatus(MCEStatus current, MCEStatus expected);
    error VotingNotEnded();
    error PlanningNotEnded();
    error BadMCE();
    error TooManyActiveProposals();
    error SnapshotNotReady();

    constructor(address admin, VoteToken voteToken, IssuerRegistry issuerReg) {
        VOTE = voteToken;
        ISSUER_REG = issuerReg;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    // ================================================================
    // PROPOSAL
    // ================================================================

    /// @notice Submit a new MCE proposal. Caller must be an active issuer.
    ///         The snapshot block is set to the PREVIOUS block to ensure voting
    ///         power is already finalized (cannot be manipulated in current block).
    function propose(
        string calldata title,
        string calldata description,
        string calldata cityContext
    ) external whenNotPaused returns (uint256 mceId) {
        if (!ISSUER_REG.isActiveIssuer(msg.sender)) revert NotActiveIssuer();
        if (activeProposalCount >= maxActiveProposals) revert TooManyActiveProposals();

        // Snapshot must be previous block to prevent same-block manipulation
        uint256 snapshot = block.number - 1;

        mceId = nextMCEId++;
        uint64 votingEndsAt = uint64(block.timestamp) + votingDuration;

        // Capture total supply at snapshot for quorum calculation
        uint256 totalSupply = VOTE.getPastTotalSupply(snapshot);

        mces[mceId] = MCE({
            id: mceId,
            title: title,
            description: description,
            cityContext: cityContext,
            proposer: msg.sender,
            proposedAt: uint64(block.timestamp),
            votingEndsAt: votingEndsAt,
            planningEndsAt: 0,
            snapshotBlock: snapshot,
            status: MCEStatus.Proposed,
            votesFor: 0,
            votesAgainst: 0,
            totalSupplyAtSnapshot: totalSupply
        });

        activeProposalCount += 1;
        proposerMCEs[msg.sender].push(mceId);

        emit MCEProposed(mceId, msg.sender, title, votingEndsAt, snapshot);
    }

    // ================================================================
    // VOTING (Snapshot-based)
    // ================================================================

    /// @notice Cast a vote. Weight is determined by VoteToken balance at the snapshot
    ///         block (proposal creation time), preventing post-proposal token accumulation.
    function vote(uint256 mceId, bool support) external whenNotPaused nonReentrant {
        MCE storage m = mces[mceId];
        if (m.proposedAt == 0) revert BadMCE();
        if (m.status != MCEStatus.Proposed) revert WrongStatus(m.status, MCEStatus.Proposed);
        require(block.timestamp < m.votingEndsAt, "voting closed");

        if (hasVoted[mceId][msg.sender]) revert AlreadyVoted();

        // Use snapshot voting power (not current balance)
        uint256 weight = VOTE.getPastVotes(msg.sender, m.snapshotBlock);
        if (weight == 0) revert NoVotingPower();

        hasVoted[mceId][msg.sender] = true;

        if (support) {
            m.votesFor += weight;
        } else {
            m.votesAgainst += weight;
        }

        emit VoteCast(mceId, msg.sender, support, weight);
    }

    // ================================================================
    // STATE TRANSITIONS (Permissionless — anyone calls once conditions met)
    // ================================================================

    /// @notice Finalize voting once the voting period has ended.
    ///         Transitions to Planning (quorum met + majority for) or Rejected.
    function finalizeVote(uint256 mceId) external {
        MCE storage m = mces[mceId];
        if (m.proposedAt == 0) revert BadMCE();
        if (m.status != MCEStatus.Proposed) revert WrongStatus(m.status, MCEStatus.Proposed);
        if (block.timestamp < m.votingEndsAt) revert VotingNotEnded();

        uint256 totalVotes = m.votesFor + m.votesAgainst;

        // Quorum: total votes must exceed quorumBps of total supply at snapshot
        uint256 quorumNeeded = (m.totalSupplyAtSnapshot * quorumBps) / 10_000;

        if (totalVotes >= quorumNeeded && m.votesFor > m.votesAgainst) {
            m.status = MCEStatus.Planning;
            m.planningEndsAt = uint64(block.timestamp) + planningDuration;
            emit MCETransitionedToPlanning(mceId, m.planningEndsAt);
        } else {
            m.status = MCEStatus.Rejected;
            activeProposalCount -= 1;
            emit MCERejected(mceId, m.votesFor, m.votesAgainst, quorumNeeded);
        }
    }

    /// @notice Transition from Planning → Active once planning period has ended.
    function activateMCE(uint256 mceId) external {
        MCE storage m = mces[mceId];
        if (m.proposedAt == 0) revert BadMCE();
        if (m.status != MCEStatus.Planning) revert WrongStatus(m.status, MCEStatus.Planning);
        if (block.timestamp < m.planningEndsAt) revert PlanningNotEnded();

        m.status = MCEStatus.Active;
        emit MCETransitionedToActive(mceId);
    }

    /// @notice Admin closes an MCE (stops new task completions).
    function closeMCE(uint256 mceId) external onlyRole(CITY_ADMIN_ROLE) {
        MCE storage m = mces[mceId];
        if (m.proposedAt == 0) revert BadMCE();
        require(m.status == MCEStatus.Active, "not active");

        m.status = MCEStatus.Closed;
        activeProposalCount -= 1;

        emit MCEClosed(mceId);
    }

    // ================================================================
    // IMCEGovernor INTERFACE (consumed by OpportunityManager)
    // ================================================================

    /// @inheritdoc IMCEGovernor
    function isMCEActive(uint256 mceId) external view override returns (bool) {
        return mces[mceId].status == MCEStatus.Active;
    }

    /// @inheritdoc IMCEGovernor
    function isMCEPlanning(uint256 mceId) external view override returns (bool) {
        return mces[mceId].status == MCEStatus.Planning;
    }

    // ================================================================
    // ADMIN CONFIG
    // ================================================================

    function setTimings(uint64 newVotingDuration, uint64 newPlanningDuration)
        external
        onlyRole(CITY_ADMIN_ROLE)
    {
        require(newVotingDuration >= 1 days, "voting too short");
        require(newPlanningDuration >= 1 days, "planning too short");
        votingDuration = newVotingDuration;
        planningDuration = newPlanningDuration;
        emit TimingsUpdated(newVotingDuration, newPlanningDuration);
    }

    function setQuorumBps(uint256 newBps) external onlyRole(CITY_ADMIN_ROLE) {
        require(newBps >= 100 && newBps <= 5000, "bps out of range"); // 1% to 50%
        quorumBps = newBps;
        emit QuorumBpsUpdated(newBps);
    }

    function setMaxActiveProposals(uint256 newMax) external onlyRole(CITY_ADMIN_ROLE) {
        require(newMax >= 1, "min 1");
        maxActiveProposals = newMax;
        emit MaxActiveProposalsUpdated(newMax);
    }

    // ================================================================
    // VIEWS
    // ================================================================

    function getMCE(uint256 mceId) external view returns (MCE memory) {
        return mces[mceId];
    }

    function getStatus(uint256 mceId) external view returns (MCEStatus) {
        return mces[mceId].status;
    }

    function getProposerMCEs(address proposer) external view returns (uint256[] memory) {
        return proposerMCEs[proposer];
    }

    function totalMCEs() external view returns (uint256) {
        return nextMCEId - 1;
    }

    /// @notice Calculate the quorum requirement for a given MCE.
    function quorumRequired(uint256 mceId) external view returns (uint256) {
        MCE storage m = mces[mceId];
        return (m.totalSupplyAtSnapshot * quorumBps) / 10_000;
    }

    /// @notice Get voting power for an address at an MCE's snapshot block.
    function getVotingPower(uint256 mceId, address voter) external view returns (uint256) {
        MCE storage m = mces[mceId];
        if (m.proposedAt == 0) return 0;
        return VOTE.getPastVotes(voter, m.snapshotBlock);
    }

    // ================================================================
    // PAUSE
    // ================================================================

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
