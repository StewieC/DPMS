const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying PropertyVault locally...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Deploy mock token first
  const MockToken = await hre.ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy("MockToken", "MTK", 1000000);
  await mockToken.waitForDeployment();
  console.log("MockToken deployed to:", await mockToken.getAddress());

  // Deploy PropertyVault
  const PropertyVault = await hre.ethers.getContractFactory("PropertyVault");
  const propertyVault = await PropertyVault.deploy([await mockToken.getAddress()]);
  await propertyVault.waitForDeployment();

  const propertyVaultAddress = await propertyVault.getAddress();
  console.log("PropertyVault deployed to:", propertyVaultAddress);

  // Save deployment info
  const data = {
    address: propertyVaultAddress,
    abi: JSON.parse(propertyVault.interface.formatJson())
  };

  fs.writeFileSync("./frontend/contractData.json", JSON.stringify(data, null, 2));
  console.log("✅ Contract data saved to frontend/contractData.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
