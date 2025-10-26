import contractData from "./contractData.json" assert { type: "json" };

let provider, signer, contract;

const connectWalletBtn = document.getElementById("connectWalletBtn");
const walletAddress = document.getElementById("walletAddress");

connectWalletBtn.onclick = async () => {
  if (!window.ethereum) {
    alert("MetaMask not detected!");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  const address = await signer.getAddress();
  walletAddress.textContent = `Connected: ${address}`;

  contract = new ethers.Contract(contractData.address, contractData.abi, signer);
  console.log("Contract connected:", contractData.address);
};

// CREATE PROPERTY
document.getElementById("createPropertyBtn").onclick = async () => {
  const tenant = document.getElementById("tenantAddress").value;
  const rent = document.getElementById("rentAmount").value;
  const savingsPct = document.getElementById("savingsPercentage").value;
  const savingsGoal = document.getElementById("savingsGoal").value;

  try {
    const tx = await contract.createProperty(tenant, rent, savingsPct, savingsGoal);
    await tx.wait();
    alert("✅ Property created successfully!");
  } catch (err) {
    console.error(err);
    alert("❌ Error creating property.");
  }
};

// PAY RENT
document.getElementById("payRentBtn").onclick = async () => {
  const propertyId = document.getElementById("propertyIdRent").value;
  const tokenAddr = document.getElementById("tokenAddressRent").value;

  try {
    const tx = await contract.payRent(propertyId, tokenAddr);
    await tx.wait();
    alert("✅ Rent payment successful!");
  } catch (err) {
    console.error(err);
    alert("❌ Error paying rent.");
  }
};

// WITHDRAW SAVINGS
document.getElementById("withdrawBtn").onclick = async () => {
  const propertyId = document.getElementById("propertyIdWithdraw").value;

  try {
    const tx = await contract.withdrawSavings(propertyId);
    await tx.wait();
    alert("✅ Savings withdrawn!");
  } catch (err) {
    console.error(err);
    alert("❌ Error withdrawing savings.");
  }
};

// VIEW PROGRESS
document.getElementById("viewProgressBtn").onclick = async () => {
  const propertyId = document.getElementById("propertyIdProgress").value;

  try {
    const progress = await contract.getSavingsProgress(propertyId);
    document.getElementById("progressOutput").textContent = `Progress: ${progress}%`;
  } catch (err) {
    console.error(err);
    alert("❌ Error fetching progress.");
  }
};
