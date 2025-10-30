import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract, getContractReadOnly } from "../utils/contract";

export default function TenantDashboard({ account }: { account: string }) {
  const [property, setProperty] = useState<any>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    loadProperty();
  }, [account]);

  const loadProperty = async () => {
    try {
      const contract = getContractReadOnly();
      const prop = await contract.getTenantProperty(account);
      setProperty(prop);
      // Get token from acceptedTokens[0]
      const tokens = await contract.acceptedTokens(0);
      setToken(tokens);
    } catch (e) {
      console.log("No property found");
    }
  };

  const payRent = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.payRent(property.propertyId || 1, token);
      await tx.wait();
      alert("Rent paid!");
      loadProperty();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  if (!property) return <p>No room assigned.</p>;

  return (
    <div className="card">
      <h2 className="section-title">Tenant: {property.roomLabel}</h2>
      <p>Rent: {ethers.formatUnits(property.rentAmount, 6)} USDC/month</p>
      <p>Saved: {ethers.formatUnits(property.totalSaved, 6)} / {ethers.formatUnits(property.savingsGoal, 6)}</p>
      <p>Points: {property.savingsPoints.toString()}</p>
      <button onClick={payRent} className="btn">Pay Rent Now</button>
    </div>
  );
}