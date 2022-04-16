const ethers = require("ethers")

export function swapSignature(send, acquire, counterParty, nonce, deadline){
    const domain = {
        name: 'P2PTrade',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    }

    const types = {
        Items: [
          { name: 'assetType', type: 'uint8' },
          { name: 'contractAddress', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'id', type: 'uint256' }
        ],
    
        SwapSignature: [
          { name: 'send', type: 'Items[]' },
          { name: 'acquire', type: 'Items[]' },
          { name: 'counterParty', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
    }

    const value = {
        send,
        acquire,
        counterParty,
        nonce,
        deadline
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signature = await signer._signTypedData(domain,types,value)

    let { v, r, s } = ethers.utils.splitSignature(signature)
    

    return {
        v,
        r,
        s,
        nonce: _nonce,
        deadline: _deadline 
    }

}

//Example
/**
swapSignature([{
    assetType: 0,
    contractAddress: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
    amount: ethers.utils.parseEther("21"),
    id: 0
  }],[{
    assetType: 0,
    contractAddress: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    amount: ethers.utils.parseEther("15"),
    id: 0
  },
  {
    assetType: 1,
    contractAddress: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
    amount: 1,
    id: 1
  }
], "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 0, Math.floor(Date.now() / 1000) + 60 * 20)
 */