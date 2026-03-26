// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title INonTransferable — marker interface for soul-bound tokens.
interface INonTransferable {
    function isNonTransferable() external pure returns (bool);
}
