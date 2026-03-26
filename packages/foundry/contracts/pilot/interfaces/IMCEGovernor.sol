// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IMCEGovernor — interface consumed by OpportunityManager to validate MCE status.
/// @notice Decouples OpportunityManager from the concrete MCEGovernor implementation,
///         preventing circular import dependencies.
interface IMCEGovernor {
    /// @notice Returns true if the given MCE is in Active status and can accept task claims/completions.
    function isMCEActive(uint256 mceId) external view returns (bool);

    /// @notice Returns true if the given MCE is in Planning status and can accept task creation.
    function isMCEPlanning(uint256 mceId) external view returns (bool);
}
