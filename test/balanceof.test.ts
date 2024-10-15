import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { depositFixture } from "./fixtures";

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
});
