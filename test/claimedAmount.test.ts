import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { depositFixture } from "./fixtures";

describe("ClaimedAmount", () => {
  it("should return 0 if user has balance but never claimed", async () => {
    const { alice, vault } = await loadFixture(depositFixture);

    const bobBalance = await vault.read.claimedAmount([alice.account.address]);
    expect(bobBalance).to.equal(0n);
  });

  it("should return 0 if user has no balance and never claimed", async () => {
    const { carol, vault } = await loadFixture(depositFixture);

    const bobBalance = await vault.read.claimedAmount([carol.account.address]);
    expect(bobBalance).to.equal(0n);
  });

  it("should return correct claimed amount when claimed all available balance", async () => {
    const { alice, vault, amounts } = await loadFixture(depositFixture);

    await vault.write.claim([0n], {account:alice.account});
    const claimedAmount = await vault.read.claimedAmount([alice.account.address]);

    expect(claimedAmount).to.equal(amounts[0]);
  });

  it("should return correct claimed amount when claimed multiple times", async () => {
    const { alice, vault, amounts } = await loadFixture(depositFixture);
    const claim1 = amounts[0] / 2n;
    const claim2 = amounts[0] - claim1;

    await vault.write.claim([claim1], {account:alice.account});
    await vault.write.claim([claim2], {account:alice.account});

    const claimedAmount = await vault.read.claimedAmount([alice.account.address]);
    expect(claimedAmount).to.equal(amounts[0]);
  });
});
