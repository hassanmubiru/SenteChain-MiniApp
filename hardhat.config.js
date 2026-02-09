require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/**
 * NOTE: This project has been migrated to Stellar blockchain.
 * This Hardhat configuration is kept for reference only.
 * 
 * To build and deploy:
 * - Build Soroban contracts: npm run build:soroban
 * - Deploy to Stellar: npm run deploy:stellar
 * 
 * See STELLAR_SETUP.md for detailed instructions.
 */

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532
    }
  },
  paths: {
    sources: "./smart_contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
