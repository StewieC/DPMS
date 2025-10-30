import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract, getContractReadOnly } from "../utils/contract";

export default function OwnerDashboard() {
  const [properties, setProperties] = useState<any[]>([]);
  const [tenant, setTenant] = useState("");
  const [roomLabel, setRoomLabel] = useState("");
  const [rent, setRent] = useState("");
  const [savingsPct, setSavingsPct] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const contract = getContractReadOnly();
      const props = await contract.getAllProperties();
      setProperties(props);
    } catch (e) {
      console.error(e);
    }
  };

  const createProperty = async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.createProperty(
        tenant,
        roomLabel,
        ethers.parseUnits(rent, 6),
        parseInt(savingsPct),
        ethers.parseUnits(goal, 6)
      );
      await tx.wait();
      alert("Room created!");
      loadProperties();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  const withdraw = async (id: number) => {
    try {
      const contract = await getContract();
      const tx = await contract.withdrawSavings(id);
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
        <input placeholder="Tenant Address" value={tenant} onChange={e => setTenant(e.target.value)} className="input" />
        <input placeholder="Room Label (e.g., 101)" value={roomLabel} onChange={e => setRoomLabel(e.target.value)} className="input" />
        <input placeholder="Rent (USDC)" value={rent} onChange={e => setRent(e.target.value)} className="input" />
        <input placeholder="Savings %" value={savingsPct} onChange={e => setSavingsPct(e.target.value)} className="input" />
        <input placeholder="Savings Goal" value={goal} onChange={e => setGoal(e.target.value)} className="input" />
        <button onClick={createProperty} disabled={loading} className="btn">
          {loading ? "Creating..." : "Create Room"}
        </button>
      </div>

      <div className="section">
        <h3>All Rooms</h3>
        {properties.length === 0 ? (
          <p>No rooms yet.</p>
        ) : (
          properties.map((p: any, i) => (
            <div key={i} className="p-4 border rounded mb-2 bg-white/50">
              <p><strong>{p.roomLabel}</strong> → {p.tenant.slice(0, 6)}...{p.tenant.slice(-4)}</p>
              <p>Rent: {ethers.formatUnits(p.rentAmount, 6)} USDC | Saved: {ethers.formatUnits(p.totalSaved, 6)} / {ethers.formatUnits(p.savingsGoal, 6)}</p>
              <button onClick={() => withdraw(i + 1)} className="btn mt-2">Withdraw Savings</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}