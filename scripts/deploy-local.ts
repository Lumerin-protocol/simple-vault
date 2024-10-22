import { viem } from "hardhat";

async function main() {
  const [_, alice] = await viem.getWalletClients();

  const lmr = await viem.deployContract("LumerinToken", []);
  console.log(`Lumerin deployed at ${lmr.address}`);

  const vault = await viem.deployContract("SimpleVault", [lmr.address]);
  console.log(`Vault deployed at ${vault.address}`);

  const lmrDecimals = 8n;
  const lmrDeposit = 100_000n * 10n ** lmrDecimals;
  await lmr.write.approve([vault.address, lmrDeposit]);
  await vault.write.batchDeposit([[alice.account.address], [lmrDeposit]]);

  console.log();
  console.log(`---------------------------------------------------------------------`);
  console.log(`Lumerin address:\t${lmr.address}`);
  console.log(`Vault address:\t\t${vault.address}`);
  console.log();
  console.log(`Deposits:`);
  console.log(`${alice.account.address}:\t${lmrDeposit} LMR`);
  console.log(`---------------------------------------------------------------------`);
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
