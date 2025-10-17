const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Example script to mint a badge NFT
 * Usage: npx hardhat run scripts/mint-badge.js --network mumbai
 */
async function main() {
  // Load latest deployment
  const network = hre.network.name;
  const deploymentPath = path.join(__dirname, "..", "deployments", `${network}-latest.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ No deployment found for network:", network);
    console.log("Please deploy the contract first using: npm run deploy:mumbai");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deployment.contractAddress;

  console.log("🎯 Minting badge on network:", network);
  console.log("📍 Contract address:", contractAddress);

  // Get contract instance
  const [signer] = await hre.ethers.getSigners();
  const LearnPathBadge = await hre.ethers.getContractFactory("LearnPathBadge");
  const badge = LearnPathBadge.attach(contractAddress);

  // Example badge data (in production, this comes from IPFS)
  const recipientAddress = process.env.RECIPIENT_ADDRESS || signer.address;
  const tokenURI = "ipfs://QmExampleCID/metadata.json"; // Replace with real IPFS CID
  const proofHash = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes(JSON.stringify({
      achievement: "First Pass",
      userId: "u1",
      timestamp: Date.now(),
    }))
  );
  const badgeType = "First Pass";

  console.log("\n📋 Minting details:");
  console.log("  Recipient:", recipientAddress);
  console.log("  Token URI:", tokenURI);
  console.log("  Proof Hash:", proofHash);
  console.log("  Badge Type:", badgeType);

  // Mint the badge
  console.log("\n⏳ Minting badge...");
  const tx = await badge.mintBadge(
    recipientAddress,
    tokenURI,
    proofHash,
    badgeType
  );

  console.log("📤 Transaction sent:", tx.hash);
  console.log("⏳ Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Badge minted successfully!");
  console.log("📦 Block number:", receipt.blockNumber);
  console.log("⛽ Gas used:", receipt.gasUsed.toString());

  // Extract token ID from event
  const event = receipt.events?.find(e => e.event === "BadgeMinted");
  if (event) {
    const tokenId = event.args.tokenId.toString();
    console.log("🎫 Token ID:", tokenId);
    
    // Query badge info
    const info = await badge.getBadgeInfo(tokenId);
    console.log("\n🔍 Badge Info:");
    console.log("  Owner:", info.owner);
    console.log("  URI:", info.uri);
    console.log("  Badge Type:", info.bType);
    console.log("  Minted:", new Date(info.minted.toNumber() * 1000).toISOString());
    console.log("  Revoked:", info.revoked);
  }

  console.log("\n✨ Minting complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

