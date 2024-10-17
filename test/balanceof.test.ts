import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployContractFixture, depositFixture } from "./fixtures";

describe("BalanceOf", () => {
  it("should return correct balance", async () => {
    const { alice, bob, vault, amounts } = await loadFixture(depositFixture);

    const aliceBalance = await vault.read.balanceOf([alice.account.address]);
    expect(aliceBalance).to.equal(amounts[0]);

    const bobBalance = await vault.read.balanceOf([bob.account.address]);
    expect(bobBalance).to.equal(amounts[1]);
  });

  it("should return 0 if no deposit", async () => {
    const { vault, carol } = await loadFixture(depositFixture);

    const balance = await vault.read.balanceOf([carol.account.address]);
    expect(balance).to.equal(0n);
  });

  it("should return correct balance for multiple deposits in separate transactions", async () => {
    const { lmr, vault, alice } = await loadFixture(deployContractFixture);
    const aliceAddr = alice.account.address;
    const amount = 1000n;

    await lmr.write.approve([vault.address, amount * 2n]);
    await vault.write.batchDeposit([[aliceAddr], [amount]]);
    await vault.write.batchDeposit([[aliceAddr], [amount]]);

    expect(await vault.read.balanceOf([aliceAddr])).to.equal(amount * 2n);
  });

  it("should return correct balance if the same address is deposited multiple times in the same transaction", async () => {
    const { lmr, vault, alice } = await loadFixture(deployContractFixture);
    const aliceAddr = alice.account.address;
    const amount = 1000n;

    await lmr.write.approve([vault.address, amount * 2n]);
    await vault.write.batchDeposit([
      [aliceAddr, aliceAddr],
      [amount, amount],
    ]);

    expect(await vault.read.balanceOf([aliceAddr])).to.equal(amount * 2n);
  });
});
