import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployContractFixture, depositFixture } from "./fixtures";
import { getAddress, zeroAddress } from "viem";

describe("Ownership", () => {
  it("should return correct owner", async () => {
    const { vault, owner } = await loadFixture(deployContractFixture);
    expect(await vault.read.owner()).to.equal(getAddress(owner.account.address));
  });

  it("should transfer ownership to alice", async () => {
    const { vault, alice, bob } = await loadFixture(depositFixture);
    await vault.write.transferOwnership([alice.account.address]);
    expect(await vault.read.owner()).to.equal(getAddress(alice.account.address));

    // verify
    await vault.write.batchCancel([[bob.account.address]], {
      account: alice.account,
    });
  });

  it("should renounce ownership", async () => {
    const { vault, owner } = await loadFixture(depositFixture);
    await vault.write.renounceOwnership();
    expect(await vault.read.owner()).to.equal(zeroAddress);
  });
});
