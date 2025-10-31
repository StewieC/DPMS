// src/components/TenantDashboard.tsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract, getContractWithProvider } from "../utils/contract";

export default function TenantDashboard({ account }: { account: string }) {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [account]);

  const loadProperty = async () => {
    try {
      const contract = await getContractWithProvider();
      const prop = await contract.getTenantProperty(account);
      setProperty(prop);
    } catch (e) {
      console.log("No property assigned to this address.");
      setProperty(null);
    }
  };

  const payRent = async () => {
    if (!property) return;
    setLoading(true);
    try {
      const contract = await getContract();
      // Get token from acceptedTokens[0]
      const tokenAddress = await contract.acceptedTokens(0);
      const tx = await contract.payRent(property.propertyId || 1, tokenAddress);
      await tx.wait();
      alert("Rent paid successfully!");
      loadProperty();
    } catch (e: any) {
      alert("Error: " + (e.message || "Payment failed"));
    }
    setLoading(false);
  };

  if (!property) {
    return (
      <div className="card">
        <h2 className="section-title">Tenant Dashboard</h2>
        <p>No room assigned to your address.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-title">Your Room: {property.roomLabel}</h2>
      <p>
        <strong>Rent:</strong> {ethers.formatUnits(property.rentAmount, 6)} USDC/month
      </p>
      <p>
        <strong>Savings Progress:</strong>{" "}
        {ethers.formatUnits(property.totalSaved, 6)} /{" "}
        {ethers.formatUnits(property.savingsGoal, 6)} USDC
      </p>
      <p>
        <strong>Points Earned:</strong> {property.savingsPoints.toString()}
      </p>
      <button onClick={payRent} disabled={loading} className="btn">
        {loading ? "Paying..." : "Pay Rent Now"}
      </button>
    </div>
  );
}