import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "./utils/contract";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [vault, setVault] = useState<any>(null);
  const [tenantAddress, setTenantAddress] = useState<string>("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  const [rentAmount, setRentAmount] = useState<string>("100");
  const [savingsPercentage, setSavingsPercentage] = useState<string>("20");
  const [savingsGoal, setSavingsGoal] = useState<string>("500");
  const [propertyId, setPropertyId] = useState<string>("1");

  useEffect(() => {
    const init = async () => {
      try {
        const contract = await getContract();
        setVault(contract);
        const accounts = await window.ethereum?.request({ method: "eth_requestAccounts" });
        setAccount(accounts ? accounts[0] : null);
      } catch (error) {
        console.error("Failed to connect:", error);
      }
    };
    init();
  }, []);

  const createProperty = async () => {
    if (vault) {
      try {
        const tx = await vault.createProperty(
          tenantAddress,
          ethers.parseUnits(rentAmount, 6),
          parseInt(savingsPercentage),
          ethers.parseUnits(savingsGoal, 6)
        );
        await tx.wait();
        alert("✅ Property created successfully!");
      } catch (error: any) {
        alert("❌ Error: " + error.message);
      }
    }
  };

  const payRent = async () => {
    if (vault) {
      try {
        const tx = await vault.payRent(parseInt(propertyId), await vault.getAddress());
        await tx.wait();
        alert("✅ Rent paid successfully!");
      } catch (error: any) {
        alert("❌ Error: " + error.message);
      }
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🏠 Property Vault</h1>
        <p className="account">Connected: {account || "Not connected"}</p>
      </header>

      <div className="card">
        <div className="section">
          <h2 className="section-title">📝 Create Property</h2>
          <div className="input-group">
            <label>Tenant Address</label>
            <input
              type="text"
              value={tenantAddress}
              onChange={(e) => setTenantAddress(e.target.value)}
              className="input"
              placeholder="0x..."
            />
          </div>
          <div className="input-group">
            <label>Monthly Rent ($)</label>
            <input
              type="number"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              className="input"
              placeholder="100"
            />
          </div>
          <div className="input-group">
            <label>Savings %</label>
            <input
              type="number"
              value={savingsPercentage}
              onChange={(e) => setSavingsPercentage(e.target.value)}
              className="input"
              placeholder="20"
            />
          </div>
          <div className="input-group">
            <label>Savings Goal ($)</label>
            <input
              type="number"
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(e.target.value)}
              className="input"
              placeholder="500"
            />
          </div>
          <button onClick={createProperty} className="btn">
            🚀 Create Property
          </button>
        </div>

        <div className="section">
          <h2 className="section-title">💰 Pay Rent</h2>
          <div className="input-group">
            <label>Property ID</label>
            <input
              type="number"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="input"
              placeholder="1"
            />
          </div>
          <button onClick={payRent} className="btn">
            💸 Pay Rent
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
