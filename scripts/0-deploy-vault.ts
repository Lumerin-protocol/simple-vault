import { viem } from "hardhat";
import { config } from "../utils/config";

async function main() {
  const lmr = await config.lumerinTokenAddress();
  const vault = await viem.deployContract("SimpleVault", [lmr]);
  console.log(`Vault deployed at ${vault.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
