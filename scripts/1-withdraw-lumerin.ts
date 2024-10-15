import { viem } from "hardhat";
import { getContract } from "viem";
import { multiABI } from "../utils/vesting-abi";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "../utils/config";

async function main() {
  const [client] = await viem.getWalletClients();

  const account = privateKeyToAccount(await config.vestingContractPrivateKey());

  const vesting = getContract({
    abi: multiABI,
    address: await config.vestingContractAddress(),
    client,
  });

  const lmr = await viem.getContractAt("ERC20", await config.lumerinTokenAddress());
  const balance = await lmr.read.balanceOf([account.address]);

  await vesting.write.transferLumerinOut([account.address, balance]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
