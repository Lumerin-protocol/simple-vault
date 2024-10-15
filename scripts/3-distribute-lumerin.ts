import { viem } from "hardhat";
import { readFileSync } from "fs";
import "../utils/bigint-json";
import { config } from "../utils/config";
import { prompt } from "../utils/prompt";

async function main() {
  const data = readFileSync(config.filename);
  const addressAmount = JSON.parse(data.toString()) as [`0x${string}`, string][];

  if (addressAmount.length === 0) {
    console.log("No addresses to deposit");
    return;
  }

  const addrs: `0x${string}`[] = [];
  const amounts: bigint[] = [];
  let totalAmount = 0n;
  for (const [address, amountString] of addressAmount) {
    const amount = BigInt(amountString);
    addrs.push(address);
    amounts.push(amount);
    totalAmount += amount;
  }

  const pc = await viem.getPublicClient();
  const vault = await viem.getContractAt("SimpleVault", await config.vaultAddress());
  const batchSize = 300;

  await prompt(`Approve ${totalAmount} tokens to vault?`);
  const token = await viem.getContractAt("ERC20", await config.lumerinTokenAddress());
  const approveTx = await token.write.approve([vault.address, totalAmount]);
  await pc.waitForTransactionReceipt({ hash: approveTx });
  console.log("Approved");

  await prompt(`Continue with depositing user funds?`);

  for (let i = 0; i < addrs.length; i += batchSize) {
    const addrsSlice = addrs.slice(i, i + batchSize);
    const amountsSlice = amounts.slice(i, i + batchSize);
    const tx = await vault.write.batchDeposit([addrsSlice, amountsSlice]);
    await pc.waitForTransactionReceipt({ hash: tx });
    console.log(
      `Batch deposited. First address: ${addrsSlice[0]}, last address: ${addrsSlice[addrsSlice.length - 1]}, next index: ${i + batchSize}`,
    );
  }

  console.log("All done");
}

main().catch((err) => {
  console.error(err);
  console.error("CAUSESESE", err.cause);
  console.error("CAUSESESE", err.cause.data.abiItem);
});
