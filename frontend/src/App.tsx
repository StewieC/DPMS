import React, { useState, useEffect } from "react";
import { getContract } from "./utils/contract";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [vault, setVault] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const contract = await getContract();
      setVault(contract);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    };
    init();
  }, []);

  const createProperty = async () => {
    if (vault) {
      const tx = await vault.createProperty(
        "0xTenantAddress", // Replace with a test tenant address
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