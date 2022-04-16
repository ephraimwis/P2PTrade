// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const DogeAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
  const ShibaAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
  const GameItemAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
  const P2PAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
  // We get the contract to deploy
  const [walletA, walletB] = await ethers.getSigners();

  const doge = await ethers.getContractAt("WrappedDoge", DogeAddress, walletA);
  const shiba = await ethers.getContractAt(
    "WrappedShiba",
    ShibaAddress,
    walletA
  );
  const gameItem = await ethers.getContractAt(
    "GameItem",
    GameItemAddress,
    walletA
  );

  const p2p = await ethers.getContractAt("P2PTrade", P2PAddress, walletA);

  //Approve NFT Swap
  const nftTx = await gameItem.approve(p2p.address, 1);
  await nftTx.wait();

  //Approve Doge Allowance of Wallet A
  const approveDogeTx = await doge.approve(p2p.address, "15000000000000000000");
  await approveDogeTx.wait();

  //Approve Shiba Allowance of Wallet B
  const walletBShibaContract = await shiba.connect(walletB);
  const approveShibaTx = await walletBShibaContract.approve(
    p2p.address,
    "21000000000000000000"
  );
  await approveShibaTx.wait();

  const fromA = [
    {
      assetType: 0,
      contractAddress: doge.address,
      amount: ethers.utils.parseEther("15"),
      id: 0,
    },
    {
      assetType: 1,
      contractAddress: gameItem.address,
      amount: 1,
      id: 1,
    },
  ];

  const fromB = [
    {
      assetType: 0,
      contractAddress: shiba.address,
      amount: ethers.utils.parseEther("21"),
      id: 0,
    },
  ];

  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  const aNonce = 0;
  const bNonce = 0;

  const sig = await walletBSignature(
    walletB,
    fromB,
    fromA,
    walletA.address,
    bNonce,
    deadline
  );
  const v = sig.v;
  const r = sig.r;
  const s = sig.s;

  const verifyTX = await p2p.verify(
    fromA,
    fromB,
    walletB.address,
    bNonce,
    deadline,
    v,
    r,
    s
  );
  //await verifyTX.wait();

  const tradeTX = await p2p.swap(
    fromA,
    fromB,
    deadline,
    walletB.address,
    aNonce,
    bNonce,
    v,
    r,
    s
  );
  //await tradeTX.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function walletBSignature(
  _signer,
  _send,
  _acquire,
  _counterParty,
  _nonce,
  _deadline
) {
  const domain = {
    name: "P2PTrade",
    version: "1",
    chainId: 1,
    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  };

  const types = {
    Items: [
      { name: "assetType", type: "uint8" },
      { name: "contractAddress", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "id", type: "uint256" },
    ],

    SwapSignature: [
      { name: "send", type: "Items[]" },
      { name: "acquire", type: "Items[]" },
      { name: "counterParty", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const value = {
    send: _send,
    acquire: _acquire,
    counterParty: _counterParty,
    nonce: _nonce,
    deadline: _deadline,
  };

  const signature = await _signer._signTypedData(domain, types, value);
  let { v, r, s } = ethers.utils.splitSignature(signature);

  return { v, r, s };
}
