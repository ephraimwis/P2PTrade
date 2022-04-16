//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;


import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GameToken is ERC1155 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC1155("GameToken") {
        awardItem(msg.sender, "NFT #2");
    }

    function awardItem(address player, string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId, 3, "");
        _setURI(tokenURI);

        return newItemId;
    }
}