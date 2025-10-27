const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying PropertyVault...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  try {
    // Deploy mock token with 6 decimals
    const MockToken = await hre.ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy("Mock USDC", "MUSDC", 1000000, 6);
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

    if (!fs.existsSync("./frontend")) fs.mkdirSync("./frontend");
    fs.writeFileSync("./frontend/contractData.json", JSON.stringify(data, null, 2));
    console.log("✅ Contract data saved to frontend/contractData.json");
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error("Error in main:", error);
  process.exitCode = 1;
});