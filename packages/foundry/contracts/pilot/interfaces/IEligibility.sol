// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IEligibility — hook interface for conditional task access.
/// @notice Implementations can gate participation on any arbitrary criteria:
///         minimum account age, attestation ownership, geographic proof, etc.
interface IEligibility {
    /// @notice Return true if `citizen` is eligible to participate in `opportunityId`.
    function isEligible(address citizen, uint256 opportunityId) external view returns (bool);
}
