const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PropertyVault", function () {
  let PropertyVault, vault, owner, tenant, token;

  beforeEach(async function () {
    [owner, tenant] = await ethers.getSigners();

    // Deploy mock token with 6 decimals (USDC-like)
    const MockToken = await ethers.getContractFactory("MockToken");
    token = await MockToken.deploy("Test USDC", "TUSDC", 1000000, 6);
    await token.waitForDeployment();

    // Deploy PropertyVault with the accepted token
    PropertyVault = await ethers.getContractFactory("PropertyVault");
    vault = await PropertyVault.deploy([await token.getAddress()]);
    await vault.waitForDeployment();

    // Approve vault to spend tokens on behalf of tenant and transfer initial funds
    await token.transfer(tenant.address, ethers.parseUnits("1000", 6));
    await token.connect(tenant).approve(vault.target, ethers.parseUnits("1000", 6));
    // Transfer some tokens to the vault for testing withdrawals
    await token.transfer(vault.target, ethers.parseUnits("100", 6)); // Add buffer for contract balance
  });

  it("Should deploy and assign correct owner", async function () {
    expect(await vault.owner()).to.equal(owner.address);
  });

  it("Should create a property", async function () {
    await vault.connect(owner).createProperty(tenant.address, ethers.parseUnits("100", 6), 20, ethers.parseUnits("500", 6));
    const property = await vault.properties(1);
    expect(property.tenant).to.equal(tenant.address);
    expect(property.rentAmount).to.equal(ethers.parseUnits("100", 6));
  });

  it("Should allow tenant to pay rent", async function () {
    await vault.connect(owner).createProperty(tenant.address, ethers.parseUnits("100", 6), 20, ethers.parseUnits("500", 6));
    await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    await vault.connect(tenant).payRent(1, await token.getAddress());
    const property = await vault.properties(1);
    expect(property.totalSaved).to.equal(ethers.parseUnits("20", 6)); // 20% of 100
  });

  it("Should allow owner to withdraw savings", async function () {
    await vault.connect(owner).createProperty(tenant.address, ethers.parseUnits("100", 6), 20, ethers.parseUnits("500", 6));
    await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    await vault.connect(tenant).payRent(1, await token.getAddress());
    // Ensure contract has enough balance for withdrawal
    const initialVaultBalance = await token.balanceOf(vault.target);
    await token.transfer(vault.target, ethers.parseUnits("100", 6)); // Add more tokens to cover withdrawal
    await vault.connect(owner).withdrawSavings(1);
    const property = await vault.properties(1);
    expect(property.totalSaved).to.equal(0);
    expect(await token.balanceOf(owner.address)).to.be.above(initialVaultBalance); // Owner should receive funds
  });
});