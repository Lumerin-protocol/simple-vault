import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { catchError } from "../utils/error";
import { zeroAddress } from "viem";
import { deployContractFixture } from "./fixtures";

describe("Deposit", () => {
  it("should deposit", async () => {
    const { lmr, vault, alice, bob } = await loadFixture(deployContractFixture);
    const addresses = [alice.account.address, bob.account.address];
    const amounts = [1000n, 2000n];
    const totalAmount = amounts.reduce((a, b) => a + b, 0n);

    await lmr.write.approve([vault.address, totalAmount]);
    await vault.write.batchDeposit([addresses, amounts]);

    const totalBalance = await lmr.read.balanceOf([vault.address]);
    expect(totalBalance).to.equal(totalAmount);

    const aliceBalance = await vault.read.balanceOf([alice.account.address]);
    expect(aliceBalance).to.equal(amounts[0]);

    const bobBalance = await vault.read.balanceOf([bob.account.address]);
    expect(bobBalance).to.equal(amounts[1]);
  });

  it("should sum multiple deposits in separate transactions", async () => {
    const { lmr, vault, alice } = await loadFixture(deployContractFixture);
    const aliceAddr = alice.account.address;
    const amount = 1000n;

    await lmr.write.approve([vault.address, amount * 2n]);
    await vault.write.batchDeposit([[aliceAddr], [amount]]);
    await vault.write.batchDeposit([[aliceAddr], [amount]]);

    expect(await vault.read.balanceOf([aliceAddr])).to.equal(amount * 2n);
  });

  it("should work if the same address is deposited multiple times in the same transaction", async () => {
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

  it("should error if zero address is provided", async () => {
    const { lmr, vault, alice } = await loadFixture(deployContractFixture);
    const aliceAddr = alice.account.address;
    const amount = 1000n;

    await lmr.write.approve([vault.address, amount * 2n]);

    await catchError(vault.abi, "ZeroAddress", async () => {
      await vault.write.batchDeposit([
        [aliceAddr, zeroAddress],
        [amount, amount],
      ]);
    });
  });

  it("should error if zero array size", async () => {
    const { vault } = await loadFixture(deployContractFixture);

    await catchError(vault.abi, "NoAddressesProvided", async () => {
      await vault.write.batchDeposit([[], []]);
    });
  });

  it("should error if array lengths are different", async () => {
    const { vault } = await loadFixture(deployContractFixture);

    await catchError(vault.abi, "ArrayLengthMismatch", async () => {
      await vault.write.batchDeposit([[], [1n]]);
    });
  });

  it("should error if not approved", async () => {
    const { lmr, vault, alice } = await loadFixture(deployContractFixture);
    const aliceAddr = alice.account.address;
    const amount = 1000n;

    await catchError(lmr.abi, "ERC20InsufficientAllowance", async () => {
      await vault.write.batchDeposit([[aliceAddr], [amount]]);
    });
  });

  it("should error if not enough balance", async () => {
    const { lmr, vault, alice } = await loadFixture(deployContractFixture);
    const aliceAddr = alice.account.address;
    const amount = 1000n;

    await lmr.write.approve([vault.address, amount], { account: aliceAddr });

    await catchError(lmr.abi, "ERC20InsufficientBalance", async () => {
      await vault.write.batchDeposit([[aliceAddr], [amount]], {
        account: aliceAddr,
      });
    });
  });
});
