# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```


```shell
const token = await ethers.getContractAt('Token', '0x5fbdb2315678afecb367f032d93f642f64180aa3')
const accounts = await ethers.getSigners();
const balance = await ethers.provider.getBalance(accounts[0].address)
ethers.utils.formatEther(balance.toString())
```
