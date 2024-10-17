import { viem, run } from "hardhat";
import { config } from "../utils/config";

async function main() {
  const lmr = await config.lumerinTokenAddress();
  const vault = await viem.deployContract("SimpleVault", [lmr]);
  console.log(`Vault deployed at ${vault.address}`);

  // verify
  await run("verify:verify", {
    address: vault.address,
    constructorArguments: [lmr],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
