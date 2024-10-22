import { defineConfig } from "@wagmi/cli";
import { hardhat } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "bindings/ts/abi.ts",
  plugins: [
    hardhat({
      project: ".",
      include: [
        "SimpleVault.sol/*.json",
        "ERC20.sol/*.json",
      ],
    }),
  ],
});
