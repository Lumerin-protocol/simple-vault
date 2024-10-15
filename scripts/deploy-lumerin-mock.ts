import { viem } from "hardhat";

async function main() {
  const lumerin = await viem.deployContract("LumerinToken", []);
  console.log(`Lumerin deployed at ${lumerin.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
