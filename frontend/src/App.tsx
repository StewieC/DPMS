import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "./utils/contract";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [vault, setVault] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const contract = await getContract();
      setVault(contract);
      const accounts = await window.ethereum?.request({ method: "eth_requestAccounts" });
      setAccount(accounts ? accounts[0] : null);
    };
    init();
  }, []);

  const createProperty = async () => {
    if (vault) {
      // Use a valid test address (replace with another account or input later)
      const tenantAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Example Hardhat account #1
      const tx = await vault.createProperty(
        tenantAddress,
        ethers.parseUnits("100", 6), // Rent amount
        20, // Savings percentage
        ethers.parseUnits("500", 6) // Savings goal
      );
      await tx.wait();
      alert("Property created!");
    }
  };

  return (
    <div className="App">
      <h1>Property Vault</h1>
      <p>Connected Account: {account}</p>
      <button onClick={createProperty}>Create Property</button>
    </div>
  );
}

export default App;