require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/**
 * SenteChain - Celo Blockchain Configuration
 * 
 * This project uses Celo blockchain for smart contract deployment.
 * 
 * To build and deploy:
 * - Deploy to Celo Alfajores: npx hardhat run smart_contracts/deploy.js --network celoAlfajores
 * - Deploy to Celo Mainnet: npx hardhat run smart_contracts/deploy.js --network celoMainnet
 * 
 * See README.md for detailed instructions.
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
    celoAlfajores: {
      url: process.env.CELO_ALFAJORES_RPC || "https://alfajores-forno.celo-testnet.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 44787
    },
    celoMainnet: {
      url: process.env.CELO_MAINNET_RPC || "https://forno.celo.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42220
    }
  },
  paths: {
    sources: "./smart_contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
