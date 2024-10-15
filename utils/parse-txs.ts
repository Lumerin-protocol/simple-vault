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
