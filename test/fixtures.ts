import { viem } from "hardhat";

export async function deployContractFixture() {
  const [owner, alice, bob, carol] = await viem.getWalletClients();
  const lmr = await viem.deployContract("LumerinToken", []);
  const vault = await viem.deployContract("SimpleVault", [lmr.address]);
  const pc = await viem.getPublicClient();
  return { lmr, pc, vault, owner, alice, bob, carol };
}

export async function depositFixture() {
  const { lmr, vault, owner, alice, bob, carol, pc } = await deployContractFixture();
  const addresses = [alice.account.address, bob.account.address];
  const amounts = [1000n, 2000n];
  const totalAmount = amounts.reduce((a, b) => a + b, 0n);

  await lmr.write.approve([vault.address, totalAmount]);
  await vault.write.batchDeposit([addresses, amounts]);

  return { lmr, pc, vault, alice, bob, carol, addresses, amounts, owner };
}
