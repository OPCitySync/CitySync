// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

import { CityToken } from "../token/CityToken.sol";

/// @title FeedbackRegistry — Gas-efficient on-chain feedback for Issuers and Redeemers.
/// @notice Participants who hold a minimum CivicCredit balance can submit ratings and
///         comments for any issuer or redeemer address. This provides a transparent,
///         censorship-resistant reputation signal within the CitySync ecosystem.
///
///         Pilot upgrades from demo:
///         - Comments are stored as bytes32 IPFS/Arweave CIDs instead of on-chain strings.
///           This reduces calldata cost from ~68 gas/byte × 140 bytes = ~9,520 gas to a
///           fixed 32 bytes = ~2,176 gas — a ~4.4x reduction.
///         - Rating (1-5 uint8) stays on-chain for cheap aggregation.
///         - Running aggregates (sum + count) maintained on-chain; averages computed off-chain.
///         - Admin can hide (soft-delete) abusive feedback without destroying the record.
///         - One feedback per (participant, target). Updates replace the previous entry.
///
/// @dev The anti-spam gate requires callers to hold a configurable minimum CityToken balance.
///      This ensures only participants who have completed verified tasks can leave feedback.
contract FeedbackRegistry is AccessControl, Pausable {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    CityToken public immutable CIVIC_CREDIT;

    uint8 public constant MIN_RATING = 1;
    uint8 public constant MAX_RATING = 5;

    /// @notice Minimum CivicCredit balance required to submit feedback.
    uint256 public minCreditBalance = 1 ether; // 1 credit (18 decimals)

    struct Feedback {
        address participant;
        uint8 rating;               // 1–5
        bytes32 commentCID;          // IPFS/Arweave content identifier
        uint64 submittedAt;
        uint64 updatedAt;
        bool hidden;                 // admin soft-delete
    }

    struct Aggregate {
        uint256 totalRatingSum;      // sum of all visible ratings
        uint256 feedbackCount;       // count of all visible feedbacks
        uint256 hiddenCount;         // count of hidden feedbacks
        // Distribution: how many 1s, 2s, 3s, 4s, 5s
        uint256[6] distribution;     // index 0 unused; [1]-[5] = count of each rating
    }

    /// @dev Feedback keyed by (target, participant). One entry per pair.
    mapping(address target => mapping(address participant => Feedback)) public feedbacks;

    /// @dev Aggregate stats per target for dashboard display.
    mapping(address => Aggregate) public aggregates;

    /// @dev Track all participants who have left feedback for a target (for enumeration).
    mapping(address target => address[]) public targetFeedbackAuthors;
    mapping(address target => mapping(address participant => bool)) internal _hasExistingFeedback;

    // ---- Events ----

    event FeedbackSubmitted(
        address indexed target,
        address indexed participant,
        uint8 rating,
        bytes32 commentCID
    );
    event FeedbackUpdated(
        address indexed target,
        address indexed participant,
        uint8 newRating,
        bytes32 newCommentCID
    );
    event FeedbackHidden(address indexed target, address indexed participant, bytes32 reasonHash);
    event FeedbackUnhidden(address indexed target, address indexed participant);
    event MinCreditBalanceUpdated(uint256 newBalance);

    // ---- Errors ----

    error InsufficientBalance(uint256 required, uint256 actual);
    error InvalidRating(uint8 provided);
    error NoExistingFeedback();
    error FeedbackAlreadyHidden();

    constructor(address admin, CityToken civicCredit) {
        CIVIC_CREDIT = civicCredit;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    // ================================================================
    // PARTICIPANT — Submit and Update Feedback
    // ================================================================

    /// @notice Submit feedback for a target (issuer or redeemer address).
    ///         If feedback already exists from this participant for this target,
    ///         it is replaced (update semantics).
    /// @param target     The issuer or redeemer address being rated.
    /// @param rating     1–5 star rating.
    /// @param commentCID IPFS/Arweave CID of the comment content. bytes32(0) = no comment.
    function submitFeedback(address target, uint8 rating, bytes32 commentCID)
        external
        whenNotPaused
    {
        _requireMinBalance();
        if (rating < MIN_RATING || rating > MAX_RATING) revert InvalidRating(rating);
        require(target != address(0), "zero target");
        require(target != msg.sender, "self-feedback");

        Feedback storage fb = feedbacks[target][msg.sender];

        if (fb.submittedAt != 0) {
            // Update existing feedback — adjust aggregates
            _removeFromAggregate(target, fb);
        } else {
            // New feedback
            targetFeedbackAuthors[target].push(msg.sender);
            _hasExistingFeedback[target][msg.sender] = true;
        }

        fb.participant = msg.sender;
        fb.rating = rating;
        fb.commentCID = commentCID;
        fb.updatedAt = uint64(block.timestamp);
        fb.hidden = false;

        if (fb.submittedAt == 0) {
            fb.submittedAt = uint64(block.timestamp);
            emit FeedbackSubmitted(target, msg.sender, rating, commentCID);
        } else {
            emit FeedbackUpdated(target, msg.sender, rating, commentCID);
        }

        _addToAggregate(target, fb);
    }

    // ================================================================
    // ADMIN — Moderation
    // ================================================================

    /// @notice Soft-delete abusive feedback. The on-chain record remains but is excluded
    ///         from aggregate calculations.
    function hideFeedback(address target, address participant, bytes32 reasonHash)
        external
        onlyRole(CITY_ADMIN_ROLE)
    {
        Feedback storage fb = feedbacks[target][participant];
        if (fb.submittedAt == 0) revert NoExistingFeedback();
        if (fb.hidden) revert FeedbackAlreadyHidden();

        _removeFromAggregate(target, fb);
        fb.hidden = true;

        Aggregate storage agg = aggregates[target];
        agg.hiddenCount += 1;

        emit FeedbackHidden(target, participant, reasonHash);
    }

    /// @notice Restore previously hidden feedback.
    function unhideFeedback(address target, address participant)
        external
        onlyRole(CITY_ADMIN_ROLE)
    {
        Feedback storage fb = feedbacks[target][participant];
        if (fb.submittedAt == 0) revert NoExistingFeedback();
        require(fb.hidden, "not hidden");

        fb.hidden = false;

        Aggregate storage agg = aggregates[target];
        agg.hiddenCount -= 1;

        _addToAggregate(target, fb);

        emit FeedbackUnhidden(target, participant);
    }

    /// @notice Update the minimum CityToken balance required to submit feedback.
    function setMinCreditBalance(uint256 newBalance) external onlyRole(CITY_ADMIN_ROLE) {
        minCreditBalance = newBalance;
        emit MinCreditBalanceUpdated(newBalance);
    }

    // ================================================================
    // INTERNAL
    // ================================================================

    function _requireMinBalance() internal view {
        uint256 bal = CIVIC_CREDIT.balanceOf(msg.sender);
        if (bal < minCreditBalance) revert InsufficientBalance(minCreditBalance, bal);
    }

    function _addToAggregate(address target, Feedback storage fb) internal {
        if (fb.hidden) return;
        Aggregate storage agg = aggregates[target];
        agg.totalRatingSum += fb.rating;
        agg.feedbackCount += 1;
        agg.distribution[fb.rating] += 1;
    }

    function _removeFromAggregate(address target, Feedback storage fb) internal {
        if (fb.hidden) return;
        Aggregate storage agg = aggregates[target];
        agg.totalRatingSum -= fb.rating;
        agg.feedbackCount -= 1;
        agg.distribution[fb.rating] -= 1;
    }

    // ================================================================
    // VIEWS
    // ================================================================

    function getFeedback(address target, address participant)
        external
        view
        returns (Feedback memory)
    {
        return feedbacks[target][participant];
    }

    function getAggregate(address target) external view returns (Aggregate memory) {
        return aggregates[target];
    }

    /// @notice Get the number of feedback entries for a target (including hidden).
    function feedbackCountForTarget(address target) external view returns (uint256) {
        return targetFeedbackAuthors[target].length;
    }

    /// @notice Paginated feedback authors for a target.
    function getFeedbackAuthors(address target, uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory result)
    {
        address[] storage authors = targetFeedbackAuthors[target];
        uint256 total = authors.length;
        if (offset >= total) return new address[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = authors[i];
        }
    }

    // ================================================================
    // PAUSE
    // ================================================================

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
