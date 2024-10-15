import { writeFileSync } from "fs";
import { viem } from "hardhat";
import { multiABI } from "../utils/vesting-abi";
import "../utils/bigint-json";
import { getClaimentAddresses } from "../utils/parse-txs";
import { config } from "../utils/config";

async function main() {
  const vestingAddress = await config.vestingContractAddress();
  const url = new URL("https://api.etherscan.io/api");
  const params = new URLSearchParams({
    module: "account",
    action: "txlist",
    address: vestingAddress,
    startblock: "0",
    endblock: "99999999",
    page: "1",
    offset: "10",
    // sort: "asc",
    apikey: await config.etherscanApiKey(),
  });
  url.search = params.toString();

  const txs = await fetch(url)
    .then((res) => res.json())
    .then((res) => res.result as { hash: `0x${string}` }[]);

  const pc = await viem.getPublicClient();
  const addresses = await getClaimentAddresses(
    pc,
    txs.map((x) => x.hash),
  );

  const addressAmountMap = new Map<`0x${string}`, bigint>();

  for (const address of addresses) {
    const vested = await pc.readContract({
      abi: multiABI,
      address: vestingAddress,
      functionName: "vestedAmount",
      args: [address, 1727877391n],
      account: address,
    });
    const released = await pc.readContract({
      abi: multiABI,
      address: vestingAddress,
      functionName: "released",
      args: [],
      account: address,
    });

    addressAmountMap.set(address, vested - released);
  }

  const addressAmount = Array.from(addressAmountMap.entries());
  console.log(`Collected ${addressAmount.length} addresses balances`);

  writeFileSync(config.filename, JSON.stringify(addressAmount, null, 2));
  console.log(`Saved to ${config.filename}`);
}

main();
