# Simple Vault contract to migrate from Lumerin Vesting contract
0. Pre-req install and update local packages
```bash
yarn 
```
0. Update the .env file with the variables

0. Deploy the SimpleVault contract (from new owner address)
```bash
yarn hardhat run  --network mainnet scripts/0-deploy-vault.ts
```

0. Set privatekey in .env file with private key of the owner of old vesting contract


0. Withdraw all tokens from old vesting contract by using withdraw-lumerin.ts

```bash
yarn hardhat run  --network mainnet scripts/1-withdraw-lumerin.ts
```

0. Run get-balances.ts to get the addresses and balances of the old vesting contract

```bash
yarn hardhat run  --network mainnet scripts/2-get-balances.ts
```

0. Check "address-amounts.json" file for the address and amount of tokens to be distributed

0. Distribute tokens to new vault contract by using distribute-lumerin.ts

```bash
yarn hardhat run  --network mainnet scripts/3-distribute-lumerin.ts
```

0. Check the new vesting contract for the distributed tokens

```bash
yarn hardhat run  --network mainnet scripts/4-check-vault.ts
```