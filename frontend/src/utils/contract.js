// src/utils/contract.js
import { ethers } from "ethers";
import contractData from "./contractData.json";

const HARDHAT_RPC = "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(HARDHAT_RPC);

// Hardhat Account #0 (Owner)
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  contractData.address,
  contractData.abi,
  signer
);

export const getContract = async () => contract;
export const getContractWithProvider = async () => 
  new ethers.Contract(contractData.address, contractData.abi, provider);