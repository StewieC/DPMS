// scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const MockToken = await hre.ethers.getContractFactory("MockToken");
  const token = await MockToken.deploy("USDC", "USDC", 1000000, 6);
  await token.waitForDeployment();
  console.log("MockToken:", await token.getAddress());

  const Vault = await hre.ethers.getContractFactory("PropertyVault");
  const vault = await Vault.deploy([await token.getAddress()], deployer.address);
  await vault.waitForDeployment();
  console.log("PropertyVault:", await vault.getAddress());

  const data = {
    address: await vault.getAddress(),
    abi: JSON.parse(vault.interface.formatJson())
  };

  fs.mkdirSync("./frontend/src/utils", { recursive: true });
  fs.writeFileSync("./frontend/src/utils/contractData.json", JSON.stringify(data, null, 2));
  console.log("Contract data saved to frontend/src/utils/contractData.json");
}

main().catch(console.error);