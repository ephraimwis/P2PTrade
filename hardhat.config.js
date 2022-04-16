require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const PRIVATE_KEY =
  "06763fce4b7dd74a3e89e5c6498cd1bd2388f246ef1402019ad104a851fa7aba";

module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/kHlA1V0hZmjw92ZB0rIuiOTVHnTtyAzY",
      },
    },
    rinkeby: {
      accounts: [`0x${PRIVATE_KEY}`],
      url: `https://eth-rinkeby.alchemyapi.io/v2/kHlA1V0hZmjw92ZB0rIuiOTVHnTtyAzY`,
    },

    arbitrum: {
      url: "https://rinkeby.arbitrum.io/rpc",
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};
