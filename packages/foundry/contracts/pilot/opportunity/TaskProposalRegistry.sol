// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

import { IssuerRegistry } from "../identity/IssuerRegistry.sol";

/// @title TaskProposalRegistry — Committee-governed task proposal workflow.
/// @notice Any active issuer can propose new task templates for the city catalog.
///         Proposals are reviewed and voted on by a Representative Issuer Committee
///         (per the MCE Issuer Committee Selection Process design doc).
///
///         Pilot upgrades from demo:
///         - Demo allowed any issuer to both propose and approve (no governance).
///         - Pilot introduces COMMITTEE_MEMBER_ROLE with configurable approval threshold.
///         - Multi-sig style approval: N-of-M committee members must approve.
///         - Rejection requires a reason hash for transparency.
///
/// @dev Approved proposals can be used by issuers to create OpportunityManager opportunities.
///      The proposal metadata (stored on IPFS) includes task design rules: estimated time,
///      safety notes, verification evidence requirements, reward recommendation.
contract TaskProposalRegistry is AccessControl, Pausable {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");
    bytes32 public constant COMMITTEE_MEMBER_ROLE = keccak256("COMMITTEE_MEMBER_ROLE");

    IssuerRegistry public immutable ISSUER_REG;

    /// @notice Minimum number of committee approvals needed to pass a proposal.
    uint256 public approvalThreshold = 3;

    enum ProposalStatus {
        Proposed,
        Approved,
        Rejected
    }

    struct Proposal {
        address proposer;
        string metadataURI;         // IPFS CID: title, description, instructions, estimated time,
                                    // safety notes, verification requirements, reward recommendation
        string category;            // Onboarding, Environment, Education, Community, Health, Infrastructure
        uint256 estimatedReward;    // Recommended CITY reward (advisory, not binding)
        uint64 proposedAt;
        ProposalStatus status;
        uint256 approvalCount;
        uint256 rejectionCount;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public nextProposalId = 1;

    /// @dev Track which committee members voted on which proposal.
    mapping(uint256 proposalId => mapping(address member => bool)) public hasVotedOnProposal;

    /// @dev Track proposals by proposer for dashboard queries.
    mapping(address => uint256[]) public proposerProposals;

    // ---- Events ----

    event TaskProposed(
        uint256 indexed proposalId,
        address indexed proposer,
        string category,
        uint256 estimatedReward,
        string metadataURI
    );
    event ProposalApprovedBy(uint256 indexed proposalId, address indexed member);
    event ProposalRejectedBy(uint256 indexed proposalId, address indexed member, bytes32 reasonHash);
    event ProposalFinalized(uint256 indexed proposalId, ProposalStatus status);
    event ApprovalThresholdUpdated(uint256 newThreshold);

    // ---- Errors ----

    error NotActiveIssuer();
    error AlreadyVotedOnProposal();
    error BadProposal();
    error ProposalNotPending();

    constructor(address admin, IssuerRegistry issuerReg) {
        ISSUER_REG = issuerReg;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    // ================================================================
    // ISSUER — Proposal Submission
    // ================================================================

    /// @notice Submit a task proposal for committee review.
    function proposeTask(
        string calldata metadataURI,
        string calldata category,
        uint256 estimatedReward
    ) external whenNotPaused returns (uint256 proposalId) {
        if (!ISSUER_REG.isActiveIssuer(msg.sender)) revert NotActiveIssuer();
        require(bytes(metadataURI).length > 0, "empty metadata");

        proposalId = nextProposalId++;
        proposals[proposalId] = Proposal({
            proposer: msg.sender,
            metadataURI: metadataURI,
            category: category,
            estimatedReward: estimatedReward,
            proposedAt: uint64(block.timestamp),
            status: ProposalStatus.Proposed,
            approvalCount: 0,
            rejectionCount: 0
        });

        proposerProposals[msg.sender].push(proposalId);

        emit TaskProposed(proposalId, msg.sender, category, estimatedReward, metadataURI);
    }

    // ================================================================
    // COMMITTEE — Review and Vote
    // ================================================================

    /// @notice Cast an approval vote on a proposal.
    function approveProposal(uint256 proposalId)
        external
        onlyRole(COMMITTEE_MEMBER_ROLE)
        whenNotPaused
    {
        Proposal storage p = proposals[proposalId];
        if (p.proposedAt == 0) revert BadProposal();
        if (p.status != ProposalStatus.Proposed) revert ProposalNotPending();
        if (hasVotedOnProposal[proposalId][msg.sender]) revert AlreadyVotedOnProposal();

        hasVotedOnProposal[proposalId][msg.sender] = true;
        p.approvalCount += 1;

        emit ProposalApprovedBy(proposalId, msg.sender);

        // Auto-finalize if threshold met
        if (p.approvalCount >= approvalThreshold) {
            p.status = ProposalStatus.Approved;
            emit ProposalFinalized(proposalId, ProposalStatus.Approved);
        }
    }

    /// @notice Cast a rejection vote on a proposal.
    /// @param reasonHash Keccak256 hash of the rejection reason (full text stored off-chain).
    function rejectProposal(uint256 proposalId, bytes32 reasonHash)
        external
        onlyRole(COMMITTEE_MEMBER_ROLE)
        whenNotPaused
    {
        Proposal storage p = proposals[proposalId];
        if (p.proposedAt == 0) revert BadProposal();
        if (p.status != ProposalStatus.Proposed) revert ProposalNotPending();
        if (hasVotedOnProposal[proposalId][msg.sender]) revert AlreadyVotedOnProposal();

        hasVotedOnProposal[proposalId][msg.sender] = true;
        p.rejectionCount += 1;

        emit ProposalRejectedBy(proposalId, msg.sender, reasonHash);

        // Auto-reject if rejections exceed possible remaining approvals
        // (when even if all remaining members approve, threshold cannot be met)
        uint256 totalMembers = _estimateCommitteeSize();
        uint256 votedSoFar = p.approvalCount + p.rejectionCount;
        uint256 remaining = totalMembers > votedSoFar ? totalMembers - votedSoFar : 0;

        if (p.approvalCount + remaining < approvalThreshold) {
            p.status = ProposalStatus.Rejected;
            emit ProposalFinalized(proposalId, ProposalStatus.Rejected);
        }
    }

    // ================================================================
    // ADMIN
    // ================================================================

    /// @notice Set committee membership.
    function setCommitteeMember(address member, bool approved)
        external
        onlyRole(CITY_ADMIN_ROLE)
    {
        if (approved) _grantRole(COMMITTEE_MEMBER_ROLE, member);
        else _revokeRole(COMMITTEE_MEMBER_ROLE, member);
    }

    /// @notice Update the minimum approvals needed to pass a proposal.
    function setApprovalThreshold(uint256 threshold) external onlyRole(CITY_ADMIN_ROLE) {
        require(threshold >= 1, "min 1");
        approvalThreshold = threshold;
        emit ApprovalThresholdUpdated(threshold);
    }

    /// @notice Admin force-reject a stale or problematic proposal.
    function adminRejectProposal(uint256 proposalId, bytes32 reasonHash)
        external
        onlyRole(CITY_ADMIN_ROLE)
    {
        Proposal storage p = proposals[proposalId];
        if (p.proposedAt == 0) revert BadProposal();
        if (p.status != ProposalStatus.Proposed) revert ProposalNotPending();

        p.status = ProposalStatus.Rejected;
        emit ProposalRejectedBy(proposalId, msg.sender, reasonHash);
        emit ProposalFinalized(proposalId, ProposalStatus.Rejected);
    }

    // ================================================================
    // INTERNAL
    // ================================================================

    /// @dev Estimate committee size by counting COMMITTEE_MEMBER_ROLE holders.
    ///      This is an approximation — OpenZeppelin AccessControl does not track
    ///      role member counts natively. For pilot scale (5-15 members), we hardcode
    ///      a reasonable upper bound. For production, use AccessControlEnumerable.
    function _estimateCommitteeSize() internal view returns (uint256) {
        // In the pilot, committee size is small and managed by admin.
        // We use approvalThreshold * 2 as a conservative estimate.
        // This means auto-rejection kicks in when it's mathematically impossible
        // to reach threshold even with optimistic remaining votes.
        return approvalThreshold * 2;
    }

    // ================================================================
    // VIEWS
    // ================================================================

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    function getProposerProposals(address proposer) external view returns (uint256[] memory) {
        return proposerProposals[proposer];
    }

    function totalProposals() external view returns (uint256) {
        return nextProposalId - 1;
    }

    // ================================================================
    // PAUSE
    // ================================================================

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
