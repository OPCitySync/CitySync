// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IRedemptionPolicy — anti-abuse hook for the Redemption contract.
/// @notice Implementations can enforce per-epoch caps, cooldowns, or
///         graduated-sanctions-based restrictions on redemption activity.
interface IRedemptionPolicy {
    /// @notice Return true if a redemption request should be allowed.
    function canRequestRedemption(address citizen, address redeemer, uint256 amount) external view returns (bool);

    /// @notice Return true if a finalization should be allowed.
    function canFinalizeRedemption(bytes32 requestId, address redeemer) external view returns (bool);
}
