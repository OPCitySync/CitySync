// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Nonces } from "@openzeppelin/contracts/utils/Nonces.sol";

import { INonTransferable } from "../interfaces/INonTransferable.sol";

/// @title VoteToken — Non-transferable governance token with checkpointed voting power.
/// @notice Soul-bound ERC20Votes token minted alongside CityToken upon task verification.
///         Provides historical voting-power queries via `getPastVotes(account, timepoint)`
///         which MCEGovernor uses for snapshot-based voting.
///
/// @dev Self-delegation is triggered automatically on first mint. Since the token is
///      non-transferable, delegation to others has no economic meaning but is technically
///      permitted by ERC20Votes (the delegated voting power cannot be transferred anyway).
contract VoteToken is ERC20, ERC20Permit, ERC20Votes, AccessControl, INonTransferable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    error NonTransferable();

    constructor(string memory name_, string memory symbol_, address admin) ERC20(name_, symbol_) ERC20Permit(name_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function isNonTransferable() external pure returns (bool) {
        return true;
    }

    /// @notice Mint vote tokens to a citizen after verified task completion.
    function mintTo(address citizen, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(citizen, amount);
        // Auto-delegate to self on first mint so voting power is immediately active
        if (delegates(citizen) == address(0)) {
            _delegate(citizen, citizen);
        }
    }

    /// @dev Disallow transfers (but allow mint/burn).
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
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

    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
