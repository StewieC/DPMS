import React, { useState, useEffect } from "react";
import { getContractWithProvider } from "./utils/contract";
import OwnerDashboard from "./components/OwnerDashboard";
import TenantDashboard from "./components/TenantDashboard";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // Auto-connect on load
    if (window.ethereum?.selectedAddress) {
      connectWallet();
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const addr = accounts[0];
      setAccount(addr);

      // Use MetaMask provider (GUARANTEED to be on correct network)
      const contract = await getContractWithProvider();
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === addr.toLowerCase());
    } catch (error: any) {
      console.error("Connect failed:", error);
      alert("Failed to connect: " + error.message);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Property Vault</h1>
        <p>Connected: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}</p>
        <button onClick={connectWallet} className="btn mt-4">
          {account ? "Switch Wallet" : "Connect Wallet"}
        </button>
      </header>

      {account && isOwner && <OwnerDashboard />}
      {account && !isOwner && <TenantDashboard account={account} />}
    </div>
  );
}

export default App;