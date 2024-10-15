import { PublicClient } from "viem";

interface BalanceOf {
  read: {
    balanceOf: (a: [`0x${string}`], b?: { blockNumber?: bigint }) => Promise<bigint>;
  };
}

/** Returns the change of address token balance due to the transaction */
export async function getTxDeltaBalance(
  pc: PublicClient,
  txHash: `0x${string}`,
  address: `0x${string}`,
  token: BalanceOf,
): Promise<bigint> {
  const receipt = await pc.waitForTransactionReceipt({ hash: txHash });
  const before = await token.read.balanceOf([address], {
    blockNumber: receipt.blockNumber - 1n,
  });
  const after = await token.read.balanceOf([address]);
  return after - before;
}
