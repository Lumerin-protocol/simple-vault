# Simple Vault contract to migrate from Lumerin Vesting contract

1. Deploy the SimpleVault contract
2. Set privatekey in .env file with private key of the owner of old vesting contract
3. Withdraw all tokens from old vesting contract by using withdraw-lumerin.ts
4. Run get-balances.ts to get the addresses and balances of the old vesting contract
5. Check "address-amounts.json" file for the address and amount of tokens to be distributed
6. Distribute tokens to new vault contract by using distribute-lumerin.ts
7. Check the new vesting contract for the distributed tokens
