const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PropertyVault", function () {
  let PropertyVault, vault, owner, tenant, token;

  beforeEach(async function () {
    [owner, tenant] = await ethers.getSigners();

    // Deploy a mock ERC20 token to act as the accepted token
    const MockToken = await ethers.getContractFactory("MockToken");
    token = await MockToken.deploy("Test Token", "TT", ethers.parseUnits("1000000", 18));
    await token.waitForDeployment();

    // Deploy PropertyVault with the accepted token list
    PropertyVault = await ethers.getContractFactory("PropertyVault");
    vault = await PropertyVault.deploy([await token.getAddress()]); // <-- pass array with token address
    await vault.waitForDeployment();
  });

  it("Should deploy and assign correct owner", async function () {
    expect(await vault.owner()).to.equal(owner.address);
  });
});
