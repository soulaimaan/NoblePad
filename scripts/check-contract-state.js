import { ethers } from 'ethers';

const PRESALE_ABI = [
  "function owner() view returns (address)",
  "function softCap() view returns (uint256)",
  "function hardCap() view returns (uint256)",
  "function presaleRate() view returns (uint256)",
  "function startTime() view returns (uint256)",
  "function endTime() view returns (uint256)",
  "function totalRaised() view returns (uint256)",
  "function isPresaleOpen() view returns (bool)",
  "function contribute() payable"
];

async function checkContract() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const contractAddress = '0x1a6a77844d98cf38dd94446a2247843f58b4e227';
  
  console.log('🔍 Checking contract at:', contractAddress);
  
  // Check if contract exists
  const code = await provider.getCode(contractAddress);
  if (code === '0x') {
    console.error('❌ No contract found at this address!');
    return;
  }
  
  console.log('✅ Contract exists');
  
  // Check contract state
  const contract = new ethers.Contract(contractAddress, PRESALE_ABI, provider);
  
  try {
    const owner = await contract.owner();
    const softCap = await contract.softCap();
    const hardCap = await contract.hardCap();
    const rate = await contract.presaleRate();
    const startTime = await contract.startTime();
    const endTime = await contract.endTime();
    const totalRaised = await contract.totalRaised();
    const isOpen = await contract.isPresaleOpen();
    
    console.log('\n📊 Contract State:');
    console.log('Owner:', owner);
    console.log('Soft Cap:', ethers.formatEther(softCap), 'ETH');
    console.log('Hard Cap:', ethers.formatEther(hardCap), 'ETH');
    console.log('Rate:', rate.toString(), 'tokens per ETH');
    console.log('Start Time:', new Date(Number(startTime) * 1000).toLocaleString());
    console.log('End Time:', new Date(Number(endTime) * 1000).toLocaleString());
    console.log('Total Raised:', ethers.formatEther(totalRaised), 'ETH');
    console.log('Is Open:', isOpen);
    
    // Check current time
    const now = Math.floor(Date.now() / 1000);
    console.log('\n🕒 Time Check:');
    console.log('Current Time:', new Date().toLocaleString());
    console.log('Has Started:', now >= Number(startTime));
    console.log('Has Ended:', now >= Number(endTime));
    
    if (!isOpen) {
      console.error('\n❌ Presale is NOT open!');
      if (now < Number(startTime)) {
        console.log('Reason: Presale has not started yet');
      } else if (now >= Number(endTime)) {
        console.log('Reason: Presale has ended');
      }
    } else {
      console.log('\n✅ Presale is open and accepting contributions');
    }
  } catch (error) {
    console.error('❌ Error reading contract:', error.message);
  }
}

checkContract();
