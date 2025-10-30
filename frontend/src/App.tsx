import React, { useState, useEffect } from "react";
import { getContractReadOnly } from "./utils/contract";
import OwnerDashboard from "./components/OwnerDashboard";
import TenantDashboard from "./components/TenantDashboard";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const addr = accounts[0];
    setAccount(addr);

    // Check if owner
    const contract = getContractReadOnly();
    const owner = await contract.owner();
    setIsOwner(owner.toLowerCase() === addr.toLowerCase());
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Property Vault</h1>
        <p>Connected: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}</p>
        <button onClick={connectWallet} className="btn mt-4">Connect Wallet</button>
      </header>

      {account && isOwner && <OwnerDashboard />}
      {account && !isOwner && <TenantDashboard account={account} />}
    </div>
  );
}

export default App;