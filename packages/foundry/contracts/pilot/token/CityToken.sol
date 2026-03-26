// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

import { INonTransferable } from "../interfaces/INonTransferable.sol";

/// @title CityToken — Non-transferable civic credit token.
/// @notice Soul-bound ERC20 representing civic engagement credits earned by
///         completing verified tasks. Minted exclusively by OpportunityManager
///         upon task verification. Burned exclusively by Redemption when a citizen
///         purchases a redeemer offering.
///
/// @dev Transfer, transferFrom, and approve all revert unconditionally.
///      The _update override allows mint (from=0) and burn (to=0) only.
///      18 decimals by default (OpenZeppelin ERC20 standard).
contract CityToken is ERC20, AccessControl, INonTransferable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    error NonTransferable();

    constructor(string memory name_, string memory symbol_, address admin) ERC20(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function isNonTransferable() external pure returns (bool) {
        return true;
    }

    /// @notice Mint civic credits to a citizen after verified task completion.
    function mintTo(address citizen, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(citizen, amount);
    }

    /// @notice Burn civic credits from a citizen during redemption.
    function burnFrom(address citizen, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(citizen, amount);
    }

    /// @dev OpenZeppelin v5 uses _update(from, to, amount) for mint/burn/transfer.
    ///      Disallow transfers where both from and to are non-zero.
    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) revert NonTransferable();
        super._update(from, to, value);
    }

    function approve(address, uint256) public pure override returns (bool) {
        revert NonTransferable();
    }

    function allowance(address, address) public pure override returns (uint256) {
        return 0;
    }

    function transfer(address, uint256) public pure override returns (bool) {
        revert NonTransferable();
    }

    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert NonTransferable();
    }
}
