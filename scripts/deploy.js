const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PropertyVault...");

  // Sepolia test tokens (USDC and DAI)
  const tokens = [
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC
    "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"  // DAI
  ];

  const PropertyVault = await hre.ethers.getContractFactory("PropertyVault");
  const propertyVault = await PropertyVault.deploy(tokens);

  await propertyVault.waitForDeployment();
  console.log("✅ PropertyVault deployed to:", propertyVault.address);
  console.log("📋 Save this address for frontend!");
  console.log("💰 Accepted tokens:", tokens);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});