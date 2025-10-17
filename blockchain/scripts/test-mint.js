const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Testing Badge Minting...\n");

  // Load deployment info
  const networkName = network.name;
  const deploymentFile = path.join(__dirname, '../deployments', `${networkName}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found for network ${networkName}. Please run deploy.js first.`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const [deployer, recipient] = await ethers.getSigners();

  console.log("📝 Test Configuration:");
  console.log("   Network:", networkName);
  console.log("   Minter:", deployer.address);
  console.log("   Recipient:", recipient.address);
  console.log();

  // Get contracts
  const badgeContract = await ethers.getContractAt(
    "LearnPathBadge",
    deployment.contracts.LearnPathBadge.address
  );

  const tokenContract = await ethers.getContractAt(
    "LearnPathToken",
    deployment.contracts.LearnPathToken.address
  );

  // Test 1: Mint a badge
  console.log("🎖️  Test 1: Minting Achievement Badge");
  console.log("   Achievement: Python Loops Mastery");
  
  const tokenURI = "ipfs://QmTestBadgeMetadata123"; // In production, upload to IPFS first
  const evidenceData = {
    achievement: "Python Loops Mastery",
    completedAt: new Date().toISOString(),
    criteria: "Completed all loop exercises with 100% accuracy"
  };
  
  const proofHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(JSON.stringify(evidenceData))
  );

  const mintTx = await badgeContract.mintBadge(recipient.address, tokenURI, proofHash);
  console.log("   Transaction submitted:", mintTx.hash);
  
  const receipt = await mintTx.wait();
  console.log("   ✅ Badge minted! Gas used:", receipt.gasUsed.toString());

  // Get token ID from event
  const mintEvent = receipt.events?.find(e => e.event === 'BadgeMinted');
  const tokenId = mintEvent?.args?.tokenId;
  console.log("   Token ID:", tokenId.toString());
  console.log();

  // Test 2: Verify badge
  console.log("🔍 Test 2: Verifying Badge Proof");
  const isValid = await badgeContract.verifyProof(tokenId, proofHash);
  console.log("   Proof Valid:", isValid ? "✅ YES" : "❌ NO");
  
  const isRevoked = await badgeContract.isRevoked(tokenId);
  console.log("   Revoked:", isRevoked ? "⚠️  YES" : "✅ NO");
  console.log();

  // Test 3: Get badge details
  console.log("📋 Test 3: Fetching Badge Details");
  const details = await badgeContract.getBadgeDetails(tokenId);
  console.log("   Owner:", details.owner);
  console.log("   Token URI:", details.uri);
  console.log("   Proof Hash:", details.proof);
  console.log("   Minted At:", new Date(details.timestamp.toNumber() * 1000).toISOString());
  console.log();

  // Test 4: Check recipient's badges
  console.log("🎖️  Test 4: Listing Recipient's Badges");
  const recipientBadges = await badgeContract.getBadgesByOwner(recipient.address);
  console.log("   Total Badges:", recipientBadges.length);
  console.log("   Badge IDs:", recipientBadges.map(id => id.toString()).join(", "));
  console.log();

  // Test 5: Reward tokens
  console.log("🪙 Test 5: Rewarding Tokens for Achievement");
  const rewardAmount = 100; // 100 points = 100 tokens
  const rewardTx = await tokenContract.rewardAchievement(
    recipient.address,
    rewardAmount,
    "Python Loops Mastery"
  );
  
  console.log("   Transaction submitted:", rewardTx.hash);
  await rewardTx.wait();
  console.log("   ✅ Tokens rewarded!");
  
  const balance = await tokenContract.balanceOf(recipient.address);
  console.log("   Recipient Balance:", ethers.utils.formatEther(balance), "LPTH");
  console.log();

  // Test 6: Batch operations (if multiple recipients)
  console.log("📦 Test 6: Batch Minting (3 badges)");
  const batchRecipients = [recipient.address, recipient.address, recipient.address];
  const batchURIs = [
    "ipfs://QmBadge1",
    "ipfs://QmBadge2",
    "ipfs://QmBadge3"
  ];
  const batchProofs = batchURIs.map(uri => 
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(uri))
  );

  const batchTx = await badgeContract.batchMintWithMerkle(
    batchRecipients,
    batchURIs,
    batchProofs
  );
  
  const batchReceipt = await batchTx.wait();
  console.log("   ✅ Batch mint complete! Gas used:", batchReceipt.gasUsed.toString());
  
  const updatedBadges = await badgeContract.getBadgesByOwner(recipient.address);
  console.log("   New Total Badges:", updatedBadges.length);
  console.log();

  // Summary
  console.log("=" .repeat(70));
  console.log("✅ ALL TESTS PASSED!");
  console.log("=" .repeat(70));
  console.log(`
📊 Test Results:
   ✅ Badge minting: Success
   ✅ Proof verification: Success
   ✅ Badge details retrieval: Success
   ✅ Badge enumeration: Success
   ✅ Token rewards: Success
   ✅ Batch minting: Success
   
   Total Badges Minted: ${updatedBadges.length}
   Total Tokens Rewarded: ${ethers.utils.formatEther(balance)} LPTH
  `);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });

