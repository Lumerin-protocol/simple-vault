import "dotenv/config";
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-viem";
import "@nomicfoundation/hardhat-ignition-viem";
import "hardhat-gas-reporter";
import "solidity-coverage";

if (!process.env.ETH_NODE_ADDRESS) {
  throw new Error("ETH_NODE_ADDRESS env variable is not set");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
        details: {
          yul: true,
          constantOptimizer: true,
        },
      },
    },
  },
  mocha: {
    // reporter: "",
  },
  networks: {
    mainnet: {
      url: process.env.ETH_NODE_ADDRESS,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    outputJSON: true,
    outputJSONFile: "gas.json",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    reportPureAndViewMethods: true,
    darkMode: true,
    currency: "USD",
    // offline: true,
    // L2Etherscan: process.env.ETHERSCAN_API_KEY,
    // L2: "arbitrum",
    L1Etherscan: process.env.ETHERSCAN_API_KEY,
    L1: "ethereum",
  },
};

export default config;