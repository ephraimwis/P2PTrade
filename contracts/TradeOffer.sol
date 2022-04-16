//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;

import './ReentrancyGuard.sol';

contract TradeOffer is ReentrancyGuard {
    event OfferFulfilled(address walletA, address walletB, Items[] fromA, Items[] fromB, uint256 deadline);
    event OfferCancelled(bytes32 indexed hash);

    mapping(bytes32 => bool) public cancelledOrFinalized;


    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
    }

    bytes32 constant private EIP712DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

    bytes32 immutable public DOMAIN_SEPARATOR;

    bytes32 constant ITEMS_TYPEHASH = keccak256(
        "Items(uint8 assetType,address contractAddress,uint256 amount,uint256 id)"
    );

    bytes32 constant TRADESIGNATURE_TYPEHASH = keccak256(
        "TradeSignature(address walletA,Items[] fromA,Items[] fromB,uint256 deadline)Items(uint8 assetType,address contractAddress,uint256 amount,uint256 id)"
    );


    struct Items {
        uint8 assetType;
        address contractAddress;
        uint256 amount;
        uint256 id;
    }

    struct TradeSignature{
        address walletA;
        Items[] fromA;
        Items[] fromB;
        uint256 deadline;
        
    }

    uint8 constant private ERC20 = 0;
    uint8 constant private ERC721 = 1;
    uint8 constant private ERC1155 = 2;

    constructor() {
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            EIP712DOMAIN_TYPEHASH,
            keccak256(bytes("TradeOffer")),
            keccak256(bytes("1")),
            block.chainid,
            address(this)
        ));
    }

    bytes4 private constant ERC20_SELECTOR = bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
    function safeERC20TransferFrom(address token, address from, address to, uint value) private {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(ERC20_SELECTOR, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'ERC20: TRANSFER_FAILED');
    }
    bytes4 private constant ERC721_SELECTOR = bytes4(keccak256(bytes('safeTransferFrom(address,address,uint256)')));
    function safeERC721TransferFrom(address token, address from, address to, uint256 id) private {
        (bool success,) = token.call(abi.encodeWithSelector(ERC721_SELECTOR, from, to, id));
        require(success, 'ERC721: TRANSFER_FAILED');
    }
    bytes4 private constant ERC1155_SELECTOR = bytes4(keccak256(bytes('safeTransferFrom(address,address,uint256,uint256,bytes)')));
    function safeERC1155TransferFrom(address token, address from, address to, uint256 id, uint256 amount) public {
        (bool success,) = token.call(abi.encodeWithSelector(ERC1155_SELECTOR, from, to, id, amount, ""));
        require(success, 'ERC1155: Failed Transaction');
    }

    function hashItems(Items[] calldata items) internal pure returns (bytes32) {
        bytes32[] memory sum = new bytes32[](items.length);
        for (uint i = 0; i < items.length; i++) {
            sum[i] = (keccak256(abi.encode(ITEMS_TYPEHASH, items[i].assetType, items[i].contractAddress, items[i].amount, items[i].id)));
        }
        return keccak256(abi.encodePacked(sum));
    }
    
    function digest(address walletA, Items[] calldata fromA, Items[] calldata fromB, uint256 deadline) internal view returns (bytes32){
        bytes32 structHash = keccak256(abi.encode(TRADESIGNATURE_TYPEHASH, walletA, hashItems(fromA), hashItems(fromB), deadline));
        return  keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
    }

    //Wallet B verify's that they can trade with Wallet A
    function verify(address walletA, Items[] calldata fromA, Items[] calldata fromB, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public view returns (bool){
        require(block.timestamp <= deadline,"Past Deadline");
        bytes32 hash = digest(walletA,fromA,fromB,deadline);
        require(cancelledOrFinalized[hash] == false,"Order Cancelled or Finalized");
        return ecrecover(hash, v, r, s) == walletA ;
    }

    // Assumes both parties have approved all assets being traded to be spent by the TradeOffer contract
    // {A} refers to owner of the signiture, {B} Refers to the trade() caller,
    function trade(address walletA, Items[] calldata fromA, Items[] calldata fromB, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public nonReentrant {
        require(verify(walletA, fromA, fromB, deadline, v, r, s),"Verification Failed.");
        for (uint i = 0; i < fromA.length; i++) {
            Items calldata item = fromA[i];
            if (item.assetType == ERC20) safeERC20TransferFrom(item.contractAddress, walletA, msg.sender, item.amount);
            else if (item.assetType == ERC721) safeERC721TransferFrom(item.contractAddress, walletA, msg.sender, item.id);
            else if (item.assetType == ERC1155) safeERC1155TransferFrom(item.contractAddress, walletA, msg.sender, item.id, item.amount);
        }
        for (uint i = 0; i < fromB.length; i++) {
            Items calldata item = fromB[i];
            if (item.assetType == ERC20) safeERC20TransferFrom(item.contractAddress, msg.sender, walletA, item.amount);
            else if (item.assetType == ERC721) safeERC721TransferFrom(item.contractAddress, msg.sender, walletA, item.id);
            else if (item.assetType == ERC1155) safeERC1155TransferFrom(item.contractAddress, msg.sender, walletA, item.id, item.amount);
        }
        

        bytes32 hash = digest(walletA,fromA,fromB,deadline);
        cancelledOrFinalized[hash] = true;
        emit OfferFulfilled(walletA, msg.sender, fromA, fromB, deadline);
    }

    function cancelOffer(Items[] calldata fromA, Items[] calldata fromB, uint256 deadline, uint8 v, bytes32 r, bytes32 s ) 
        internal
    {
        bytes32 hash = digest(msg.sender,fromA,fromB,deadline);
        require(msg.sender == ecrecover(hash, v, r, s), "You're not the owner of this offer.");
        require(cancelledOrFinalized[hash] == false, "Already cancelled or fulfilled.");
        cancelledOrFinalized[hash] = true;
        emit OfferCancelled(hash);
    }
}