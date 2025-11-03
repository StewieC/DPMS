// src/components/OwnerDashboard.tsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractData from "../utils/contractData.json";

export default function OwnerDashboard() {
  const [properties, setProperties] = useState<any[]>([]);
  const [tenant, setTenant] = useState("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  const [roomLabel, setRoomLabel] = useState("101");
  const [rent, setRent] = useState("100");
  const [savingsPct, setSavingsPct] = useState("20");
  const [goal, setGoal] = useState("500");
  const [loading, setLoading] = useState(false);

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const contractAddress = contractData.address;
  const abi = contractData.abi;

  const contract = new ethers.Contract(contractAddress, abi, provider);
  const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
  const contractWithSigner = contract.connect(signer);

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProperties = async () => {
    try {
      // Use contract.call() with full ABI
      const result = await contract.getAllProperties();
      console.log("Properties loaded:", result);
      setProperties(result);
    } catch (e: any) {
      console.error("Load failed:", e);
      alert("Load failed: " + e.message);
    }
  };

  const createProperty = async () => {
    if (!tenant || !roomLabel || !rent || !savingsPct || !goal) {
      alert("Fill all fields");
      return;
    }
    setLoading(true);
    try {
      const tx = await contractWithSigner.createProperty(
        tenant,
        roomLabel,
        ethers.parseUnits(rent, 6),
        parseInt(savingsPct),
        ethers.parseUnits(goal, 6)
      );
      await tx.wait();
      alert("Room created!");
      setTenant("");
      setRoomLabel("");
      setRent("");
      setSavingsPct("");
      setGoal("");
      loadProperties();
    } catch (e: any) {
      alert("Error: " + (e.message || "Failed"));
    }
    setLoading(false);
  };

  const withdraw = async (id: number) => {
    try {
      const tx = await contractWithSigner.withdrawSavings(id);
      await tx.wait();
      alert("Withdrawn!");
      loadProperties();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Owner: Manage Rooms</h2>

      <div className="section">
        <h3>Create New Room</h3>
        <input placeholder="Tenant" value={tenant} onChange={e => setTenant(e.target.value)} className="input" />
        <input placeholder="Label" value={roomLabel} onChange={e => setRoomLabel(e.target.value)} className="input" />
        <input placeholder="Rent" value={rent} onChange={e => setRent(e.target.value)} className="input" />
        <input placeholder="%" value={savingsPct} onChange={e => setSavingsPct(e.target.value)} className="input" />
        <input placeholder="Goal" value={goal} onChange={e => setGoal(e.target.value)} className="input" />
        <button onClick={createProperty} disabled={loading} className="btn">
          {loading ? "Creating..." : "Create Room"}
        </button>
      </div>

      <div className="section">
        <h3>All Rooms</h3>
        {properties.length === 0 ? (
          <p>No rooms created yet.</p>
        ) : (
          properties.map((p: any, i: number) => (
            <div key={i} className="p-4 border rounded mb-2 bg-white/50">
              <p><strong>{p.roomLabel}</strong> → {p.tenant.slice(0,6)}...{p.tenant.slice(-4)}</p>
              <p>Rent: {ethers.formatUnits(p.rentAmount, 6)} USDC</p>
              <p>Saved: {ethers.formatUnits(p.totalSaved, 6)} / {ethers.formatUnits(p.savingsGoal, 6)}</p>
              <button onClick={() => withdraw(i + 1)} className="btn mt-2">Withdraw</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}