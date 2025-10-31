// src/utils/contract.js
import { ethers } from "ethers";

const contractData = require("./contractData.json");
const abi = contractData.abi;
const address = contractData.address;

export const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(address, abi, signer);
};

// REMOVE getContractReadOnly() — USE getContract() FOR EVERYTHING
export const getContractWithProvider = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(address, abi, provider);
};