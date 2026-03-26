// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

import { INonTransferable } from "../interfaces/INonTransferable.sol";

/// @title RedemptionReceipt — Non-transferable ERC721 receipt NFT.
/// @notice Minted by the Redemption contract after a citizen purchases a redeemer
///         offering. Each token stores the redeemer address, offer ID, cost, and
///         purchase timestamp as immutable on-chain proof of the transaction.
///
/// @dev Transfer between non-zero addresses reverts (soul-bound).
///      Only mint (from=0) and burn (to=0) are permitted.
contract RedemptionReceipt is ERC721, AccessControl, INonTransferable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    error NonTransferable();

    struct Receipt {
        address redeemer;
        uint256 offerId;
        uint256 costCity;
        uint64 purchasedAt;
    }

    uint256 public nextReceiptId = 1;
    mapping(uint256 => Receipt) public receipts;

    constructor(address admin) ERC721("CitySync Redemption Receipt", "CS-RECEIPT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function isNonTransferable() external pure returns (bool) {
        return true;
    }

    /// @notice Mint a receipt NFT to a citizen after a successful redemption purchase.
    function mintTo(
        address to,
        address redeemer,
        uint256 offerId,
        uint256 costCity
    ) external onlyRole(MINTER_ROLE) returns (uint256 receiptId) {
        receiptId = nextReceiptId++;
        receipts[receiptId] = Receipt({
            redeemer: redeemer,
            offerId: offerId,
            costCity: costCity,
            purchasedAt: uint64(block.timestamp)
        });
        _mint(to, receiptId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @dev Disallow transfers where both from and to are non-zero (soul-bound).
    function _update(address to, uint256 tokenId, address auth) internal override returns (address from) {
        from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert NonTransferable();
        return super._update(to, tokenId, auth);
    }
}
