import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_TESTNET_RPC_URL || "",
      accounts: process.env.TESTNET_PRIVATE_KEY
        ? [process.env.TESTNET_PRIVATE_KEY]
        : [],
    },
  },
};

export default config;
