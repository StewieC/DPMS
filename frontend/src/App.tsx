// frontend/src/App.tsx
// import React, { useState } from "react";
import OwnerDashboard from "./components/OwnerDashboard";
import TenantDashboard from "./components/TenantDashboard";

function App() {
  const account = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const isOwner = true; // ← FORCE OWNER MODE

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