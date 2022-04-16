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

  // We get the contract to deploy
  const [walletA, walletB] = await ethers.getSigners();
  /*
  //Doge ERC20 Contract
  const Doge = await ethers.getContractFactory("WrappedDoge");
  const doge = await Doge.deploy();
  await doge.deployed();
  console.log(`Doge Address: ${doge.address}`);

  //Wallet A has been minted 150 Doge from Wallet A (walletA)
  const mintDogeTx = await doge.mint(walletA.address, "150000000000000000000");
  await mintDogeTx.wait();

  //Shiba ERC20 Contract
  const Shiba = await ethers.getContractFactory("WrappedShiba");
  const shiba = await Shiba.deploy();
  await shiba.deployed();

  console.log(`Shiba Address: ${shiba.address}`);

  //Wallet A Minted NFT #1
  const GameItem = await ethers.getContractFactory("GameItem");
  const gameItem = await GameItem.deploy();
  await gameItem.deployed();

  console.log(`GameItem Address: ${gameItem.address}`);

  //Wallet A Minted NFT #1
  const GameToken = await ethers.getContractFactory("GameToken");
  const gameToken = await GameToken.deploy();
  await gameToken.deployed();

  console.log(`GameToken Address: ${gameToken.address}`);

  //Wallet B has been minted 21 Shiba from Wallet A (walletA)
  const mintShibaTx = await shiba.mint(
    walletB.address,
    "210000000000000000000"
  );
  await mintShibaTx.wait();
 **/

  //Peer-to-peer trade
  // const P2P = await ethers.getContractFactory("P2PTrade");
  // const p2p = await P2P.deploy();
  // await p2p.deployed();

  const P2P = await ethers.getContractFactory("TradeOffer");
  const p2p = await P2P.deploy();
  await p2p.deployed();

  console.log(`TradeOffer Address: ${p2p.address}`);

  //const GameToken = await ethers.getContractFactory("GameToken");
  //const gameToken = await GameToken.deploy();

  //console.log(`GameToken Address: ${gameToken.address}`);
  /**
  //Approve NFT Swap
  const nftTx = await gameItem.approve(p2p.address, 1);
  await nftTx.wait();

  //Approve 1155 NFT Swap
  const nftTokenTx = await gameToken.setApprovalForAll(p2p.address, true);
  await nftTokenTx.wait();

  //Approve Doge Allowance of Wallet A
  const approveDogeTx = await doge.approve(
    p2p.address,
    "150000000000000000000"
  );
  await approveDogeTx.wait();

  //Approve Shiba Allowance of Wallet B
  const walletBShibaContract = await shiba.connect(walletB);
  const approveShibaTx = await walletBShibaContract.approve(
    p2p.address,
    "210000000000000000000"
  );
  await approveShibaTx.wait();
   */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
/**
  function Extra(){
    
    //Approve NFT Swap
    const nftTx = await gameItem.approve(p2p.address, 1)
    await nftTx.wait();

    //Approve Doge Allowance of Wallet A
    const approveDogeTx = await doge.approve(p2p.address, "15000000000000000000")
    await approveDogeTx.wait();

    //Approve Shiba Allowance of Wallet B
    const walletBShibaContract = await shiba.connect(walletB)
    const approveShibaTx = await walletBShibaContract.approve(p2p.address, "21000000000000000000")
    await approveShibaTx.wait();

    const fromA = [{
      assetType: 0,
      contractAddress: doge.address,
      amount: ethers.utils.parseEther("15"),
      id: 0
    },
    {
      assetType: 1,
      contractAddress: gameItem.address,
      amount: 1,
      id: 1
    }
  ]

    const fromB = [{
      assetType: 0,
      contractAddress: shiba.address,
      amount: ethers.utils.parseEther("21"),
      id: 0
    }]

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const aNonce = 0;
    const bNonce = 0;

    const sig = await walletBSignature(walletB,fromB,fromA, walletA.address, bNonce, deadline)
    const v = sig.v;
    const r = sig.r;
    const s = sig.s;

    const verifyTX = await p2p.verify(fromA, fromB, walletB.address, bNonce, deadline, v, r, s)
    await verifyTX.wait();
    
    const tradeTX = await p2p.swap(fromA, fromB, deadline, walletB.address, aNonce, bNonce, v, r, s)
    await tradeTX.wait();

  }

   */
