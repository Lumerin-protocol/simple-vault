import { decodeFunctionData, PublicClient } from "viem";
import { multiABI } from "./vesting-abi";

/** Parse transactions that add to vesting schedule to extract claiments addresses */
export async function getClaimentAddresses(
  pubClient: PublicClient,
  txHashes: `0x${string}`[],
): Promise<Set<`0x${string}`>> {
  const addresses = new Set<`0x${string}`>();

  for (const txHash of txHashes) {
    const txData = await pubClient.getTransaction({ hash: txHash });
    try {
      const parsed = decodeFunctionData({ abi: multiABI, data: txData.input });

      if (parsed.functionName === "setAddMultiAddressToVestingSchedule") {
        for (let i = 0; i < parsed.args[0].length; i++) {
          addresses.add(parsed.args[0][i]);
        }
      } else if (parsed.functionName === "setAddAddressToVestingSchedule") {
        addresses.add(parsed.args[0]);
      } else if (parsed.functionName === "setAddToVestingAmount") {
        addresses.add(parsed.args[0]);
      }
    } catch (e) {
      console.log("unknown function name: ", txData.input.slice(0, 8));
    }
  }
  return addresses;
}

export async function getClaimentAddresses2(
  pubClient: PublicClient,
  txs: { input: `0x${string}` }[],
): Promise<Set<`0x${string}`>> {
  const addresses = new Set<`0x${string}`>();

  for (const tx of txs) {
    // const txData = await pubClient.getTransaction({ hash: txHash });
    try {
      const parsed = decodeFunctionData({ abi: multiABI, data: tx.input });

      if (parsed.functionName === "setAddMultiAddressToVestingSchedule") {
        for (let i = 0; i < parsed.args[0].length; i++) {
          addresses.add(parsed.args[0][i]);
        }
      } else if (parsed.functionName === "setAddAddressToVestingSchedule") {
        addresses.add(parsed.args[0]);
      } else if (parsed.functionName === "setAddToVestingAmount") {
        addresses.add(parsed.args[0]);
      }
    } catch (e) {
      console.log("unknown function name: ", tx.input.slice(0, 8));
    }
  }
  return addresses;
}

export async function getClaimentAddresses3(
  pubClient: PublicClient,
  txs: { input: `0x${string}`; hash: `0x${string}` }[],
): Promise<{ address: string; months: number; balance: bigint; tx: string }[]> {
  const addresses: { address: string; months: number; balance: bigint; tx: string }[] = [];

  for (const tx of txs) {
    // const txData = await pubClient.getTransaction({ hash: txHash });
    try {
      const parsed = decodeFunctionData({ abi: multiABI, data: tx.input });

      if (parsed.functionName === "setAddMultiAddressToVestingSchedule") {
        for (let i = 0; i < parsed.args[0].length; i++) {
          addresses.push({
            address: parsed.args[0][i],
            months: parsed.args[1][i],
            balance: parsed.args[2][i],
            tx: tx.hash,
          });
        }
      } else if (parsed.functionName === "setAddAddressToVestingSchedule") {
        addresses.push({ address: parsed.args[0], months: parsed.args[1], balance: parsed.args[2], tx: tx.hash });
      } else if (parsed.functionName === "setAddToVestingAmount") {
        addresses.push({ address: parsed.args[0], balance: parsed.args[1], months: 0, tx: tx.hash });
      }
    } catch (e) {
      console.log("unknown function name: ", tx.input.slice(0, 8));
    }
  }
  return addresses;
}
