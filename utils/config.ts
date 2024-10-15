import { getVar, isAddress } from "./get-config";

export const config = {
  filename: "address-amounts.json",
  ethNodeAddress() {
    return getVar<string>({
      envName: "ETH_NODE_ADDRESS",
      prompt: "Enter eth node address",
      validator: async (x) => {
        if (x === "") {
          throw new Error("Value is empty");
        }
        return x;
      },
    });
  },
  vestingContractAddress() {
    return getVar<`0x${string}`>({
      envName: "VESTING_CONTRACT_ADDRESS",
      prompt: "Enter vesting contract address",
      validator: isAddress,
    });
  },
  lumerinTokenAddress() {
    return getVar<`0x${string}`>({
      envName: "LUMERIN_TOKEN_ADDRESS",
      prompt: "Enter lumerin token address",
      validator: isAddress,
    });
  },
  vestingContractPrivateKey() {
    return getVar<`0x${string}`>({
      envName: "VESTING_CONTRACT_PRIVATE_KEY",
      prompt: "Enter vesting contract private key",
      validator: async (x) => {
        if (x === "") {
          throw new Error("Value is empty");
        }
        if (!x.startsWith("0x")) {
          throw new Error("Value must start with 0x");
        }

        return x as `0x${string}`;
      },
    });
  },
  vaultAddress() {
    return getVar<`0x${string}`>({
      envName: "VAULT_ADDRESS",
      prompt: "Enter vault address",
      validator: isAddress,
    });
  },
  etherscanApiKey() {
    return getVar<string>({
      envName: "ETHERSCAN_API_KEY",
      prompt: "Enter etherscan api key",
      secret: true,
      validator: async (x) => {
        if (x === "") {
          throw new Error("Value is empty");
        }
        return x;
      },
    });
  },
};
