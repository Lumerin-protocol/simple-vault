import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { catchError } from "../utils/error";
import { maxUint256, padHex, zeroAddress } from "viem";
import { deployContractFixture, depositFixture } from "./fixtures";
import crypto from "node:crypto";

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

  it("should emit events", async () => {
    const { lmr, vault, alice, bob } = await loadFixture(deployContractFixture);
    const addresses = [alice.account.address, bob.account.address];
    const amounts = [1000n, 2000n];
    const totalAmount = amounts.reduce((a, b) => a + b, 0n);

    await lmr.write.approve([vault.address, totalAmount]);
    const tx = await vault.write.batchDeposit([addresses, amounts]);

    const aliceEvents = await vault.getEvents.Deposit({ user: alice.account.address });
    expect(aliceEvents.length).to.equal(1);
    expect(aliceEvents[0].args).to.deep.include({ amount: amounts[0] });

    const bobEvents = await vault.getEvents.Deposit({ user: bob.account.address });
    expect(bobEvents.length).to.equal(1);
    expect(bobEvents[0].args).to.deep.include({ amount: amounts[1] });
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

  it("should error with overflow if attempting to deposit large amount", async () => {
    const { lmr, vault, alice } = await loadFixture(depositFixture);
    const aliceAddr = alice.account.address;
    const amount = maxUint256;

    await lmr.write.approve([vault.address, amount]);

    try {
      await vault.write.batchDeposit([[aliceAddr], [amount]]);
      expect.fail("Should have thrown");
    } catch (e) {
      expect((e as Error)?.message).includes("reverted with panic code 0x11");
    }
  });
});

describe("Gas estimation for deposit", () => {
  it("should calculate gas for deposit", async () => {
    const { lmr, vault } = await loadFixture(deployContractFixture);
    const batchSize = 100;
    const addresses = repeatFn(randomAddress, batchSize);
    const amounts = repeat(4080_00000000n, batchSize);
    const totalAmount = amounts.reduce((a, b) => a + b, 0n);

    await lmr.write.approve([vault.address, totalAmount]);
    const gas = await vault.estimateGas.batchDeposit([addresses, amounts]);

    console.log("Gas used for depositing 100 addresses: ", gas.toString());
  });
});

function repeat<T>(v: T, n: number): T[] {
  return Array(n).fill(v);
}

function repeatFn<T>(fn: () => T, n: number): T[] {
  return Array(n).fill(0).map(fn);
}

function randomAddress(): `0x${string}` {
  return getHex(crypto.randomBytes(20), 20);
}

function getHex(buffer: Buffer, padding = 32): `0x${string}` {
  return padHex(`0x${buffer.toString("hex")}`, { size: padding });
}
