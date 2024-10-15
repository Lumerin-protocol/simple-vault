import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { catchError } from "../utils/error";
import { deployContractFixture, depositFixture } from "./fixtures";
import { getTxDeltaBalance } from "../utils/test";

describe("Claim", () => {
  it("should claim everything if amount is 0", async () => {
    const { alice, vault, lmr, pc, amounts } = await loadFixture(depositFixture);
    const hash = await vault.write.claim([0n], { account: alice.account });
    const delta = await getTxDeltaBalance(pc, hash, alice.account.address, lmr);
    expect(delta).to.equal(amounts[0]);
  });

  it("should claim partially", async () => {
    const { alice, vault, lmr, pc, amounts } = await loadFixture(depositFixture);
    const claim = amounts[0] / 2n;

    const hash = await vault.write.claim([claim], { account: alice.account });
    const delta = await getTxDeltaBalance(pc, hash, alice.account.address, lmr);
    expect(delta).to.equal(claim);

    const remaining = await vault.read.balanceOf([alice.account.address]);
    expect(remaining).to.equal(amounts[0] - claim);
  });

  it("should throw if claiming more than deposited", async () => {
    const { alice, vault, amounts } = await loadFixture(depositFixture);
    await catchError(vault.abi, "InsufficientBalance", async () => {
      await vault.write.claim([amounts[0] * 2n], { account: alice.account });
    });
  });

  it("claim from unknown address should throw", async () => {
    const { alice, vault } = await loadFixture(deployContractFixture);
    await catchError(vault.abi, "ZeroBalance", async () => {
      await vault.write.claim([0n], { account: alice.account });
    });
  });
});
