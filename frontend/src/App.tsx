import React, { useState, useEffect } from "react";
import { getContractWithProvider } from "./utils/contract";
import OwnerDashboard from "./components/OwnerDashboard";
import TenantDashboard from "./components/TenantDashboard";

function App() {
  const [isOwner, setIsOwner] = useState(false);
  const [account] = useState("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");

  useEffect(() => {
    const checkOwner = async () => {
      try {
        const contract = await getContractWithProvider();
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
      } catch (error) {
        console.error("Owner check failed:", error);
      }
    };
    checkOwner();
  }, [account]);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Property Vault</h1>
        <p>Connected: {`${account.slice(0, 6)}...${account.slice(-4)}`}</p>
        <button className="btn mt-4" disabled>
          Auto-Connected (Hardhat)
        </button>
      </header>

      {isOwner && <OwnerDashboard />}
      {!isOwner && <TenantDashboard account={account} />}
    </div>
  );
}

export default App;