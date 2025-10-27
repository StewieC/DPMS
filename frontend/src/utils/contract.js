import { ethers } from "ethers";

// Load contract data
const contractData = require("./contractData.json");
const abi = contractData.abi;
const address = contractData.address;

export const getContract = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(address, abi, signer);
};