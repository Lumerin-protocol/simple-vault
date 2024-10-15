import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { catchError } from "../utils/error";
import { deployContractFixture, depositFixture } from "./fixtures";
import { getTxDeltaBalance } from "../utils/test";

describe("Cancel", () => {
  it("should cancel and return to the owner account", async () => {
    const { alice, vault, lmr, pc, amounts, owner } = await loadFixture(depositFixture);

    const hash = await vault.write.batchCancel([[alice.account.address]]);
    const delta = await getTxDeltaBalance(pc, hash, owner.account.address, lmr);
    expect(delta).to.equal(amounts[0]);

    const balance = await vault.read.balanceOf([alice.account.address]);
    expect(balance).to.equal(0n);
  });

  it("should error if all of the accounts have zero balances", async () => {
    const { alice, vault } = await loadFixture(deployContractFixture);

    await catchError(vault.abi, "ZeroBalance", async () => {
      await vault.write.batchCancel([[alice.account.address]]);
    });
  });

  it("should not error if one of the accounts have zero balances", async () => {
    const { alice, carol, owner, vault, pc, lmr, amounts } = await loadFixture(depositFixture);

    const hash = await vault.write.batchCancel([[alice.account.address, carol.account.address]]);
    const delta = await getTxDeltaBalance(pc, hash, owner.account.address, lmr);
    expect(delta).to.equal(amounts[0]);

    const balance = await vault.read.balanceOf([alice.account.address]);
    expect(balance).to.equal(0n);
  });

  it("should not be able to cancel if not owner", async () => {
    const { alice, vault } = await loadFixture(depositFixture);

    await catchError(vault.abi, "OwnableUnauthorizedAccount", async () => {
      await vault.write.batchCancel([[alice.account.address]], {
        account: alice.account,
      });
    });
  });

  it("should be able to cancel oneself without an error", async () => {
    const { alice, vault, pc, lmr, amounts } = await loadFixture(depositFixture);

    // make alice the owner and then cancel herself
    await vault.write.transferOwnership([alice.account.address]);
    const hash = await vault.write.batchCancel([[alice.account.address]], {
      account: alice.account,
    });

    const delta = await getTxDeltaBalance(pc, hash, alice.account.address, lmr);
    expect(delta).to.equal(amounts[0]);

    const balance = await vault.read.balanceOf([alice.account.address]);
    expect(balance).to.equal(0n);
  });
});
