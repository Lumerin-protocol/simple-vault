import { viem } from "hardhat";
import { readFileSync } from "fs";
import "../utils/bigint-json";
import { config } from "../utils/config";

async function main() {
  const data = readFileSync(config.filename);
  const addressAmount = JSON.parse(data.toString()) as [`0x${string}`, string][];

  if (addressAmount.length === 0) {
    console.log("No addresses to list");
    return;
  }

  const vault = await viem.getContractAt("SimpleVault", await config.vaultAddress());

  for (const [addr, amount] of addressAmount) {
    const balance = await vault.read.balanceOf([addr as `0x${string}`]);
    console.log(`Address: ${addr}, Balance: ${balance}, expected: ${amount}`);
  }

  console.log("All done");
}

main().catch((err) => {
  console.error(err);
});
