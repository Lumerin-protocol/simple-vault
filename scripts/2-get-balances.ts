import { writeFileSync } from "fs";
import { viem } from "hardhat";
import { multiABI } from "../utils/vesting-abi";
import "../utils/bigint-json";
import { getClaimentAddresses, getClaimentAddresses2, getClaimentAddresses3 } from "../utils/parse-txs";
import { config } from "../utils/config";
import { parseTransaction } from "viem";

async function main() {
  const vestingAddress = await config.vestingContractAddress();
  const url = new URL("https://api.etherscan.io/api");
  const params = new URLSearchParams({
    module: "account",
    action: "txlist",
    address: vestingAddress,
    startblock: "0",
    endblock: "99999999",
    page: "0",
    offset: "0",
    // sort: "asc",
    apikey: await config.etherscanApiKey(),
  });
  url.search = params.toString();

  console.log(url.toString());
  // return;

  const txs = await fetch(url)
    .then((res) => res.json())
    .then((res) => res.result as { input: `0x${string}`; hash: `0x${string}` }[]);

  // console.log(`Collected ${txs.length} transactions`);

  const pc = await viem.getPublicClient();
  const addresses = await getClaimentAddresses3(pc, txs);

  // const addresses = new Set<`0x${string}`>();
  // addresses.add("0xe98f0B95292c2c7A3CEe33E091Cc953F0F1C3CBE");
  writeFileSync("__adds.json", JSON.stringify(addresses, null, 2));
  // console.log(`Collected ${addresses.size} addresses`);
  return;

  const addressAmountMap = new Map<`0x${string}`, bigint>();
  console.log("vestion", vestingAddress);

  for (const address of addresses) {
    const vested = await pc.readContract({
      abi: multiABI,
      address: vestingAddress,
      functionName: "vestedAmount",
      args: [address, 1648497898n],
      account: address,
    });
    console.log("vested", vested);
    const released = await pc.readContract({
      abi: multiABI,
      address: vestingAddress,
      functionName: "released",
      args: [],
      account: address,
    });
    console.log("released", released);

    const remaining = vested - released;
    if (remaining > 0n) {
      addressAmountMap.set(address, remaining);
    }
  }

  const addressAmount = Array.from(addressAmountMap.entries());
  console.log(`Collected ${addressAmount.length} addresses balances`);

  writeFileSync("__" + config.filename, JSON.stringify(addressAmount, null, 2));
  console.log(`Saved to ${config.filename}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
