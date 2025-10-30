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

export const getContractReadOnly = () => {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  return new ethers.Contract(address, abi, provider);
};