const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying LearnPath Blockchain Contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  // Deploy Badge Contract (ERC-721)
  console.log("📜 Deploying LearnPathBadge (ERC-721)...");
  const LearnPathBadge = await ethers.getContractFactory("LearnPathBadge");
  const badgeContract = await LearnPathBadge.deploy(
    "LearnPath Achievements",
    "LPBADGE",
    "ipfs://QmLearnPathContractMetadata/" // Update with actual IPFS URI
  );
  
  await badgeContract.deployed();
  console.log("✅ LearnPathBadge deployed to:", badgeContract.address);

  // Deploy Token Contract (ERC-20)
  console.log("\n📜 Deploying LearnPathToken (ERC-20)...");
  const LearnPathToken = await ethers.getContractFactory("LearnPathToken");
  const tokenContract = await LearnPathToken.deploy();
  
  await tokenContract.deployed();
  console.log("✅ LearnPathToken deployed to:", tokenContract.address);

  // Setup roles and permissions
  console.log("\n🔐 Configuring roles and permissions...");
  
  const MINTER_ROLE = await badgeContract.MINTER_ROLE();
  const REVOKER_ROLE = await badgeContract.REVOKER_ROLE();
  
  // For demo: keep deployer as minter. In production, grant to backend service address
  console.log("   - Badge MINTER_ROLE:", deployer.address);
  console.log("   - Badge REVOKER_ROLE:", deployer.address);
  
  // Grant minter role on token contract to badge contract (optional integration)
  const TOKEN_MINTER_ROLE = await tokenContract.MINTER_ROLE();
  // await tokenContract.grantRole(TOKEN_MINTER_ROLE, badgeContract.address);
  // console.log("   - Token MINTER_ROLE granted to Badge Contract");
  
  console.log("✅ Roles configured\n");

  // Save deployment info
  const networkName = network.name;
  const deploymentInfo = {
    network: networkName,
    chainId: (await deployer.provider.getNetwork()).chainId,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      LearnPathBadge: {
        address: badgeContract.address,
        name: "LearnPath Achievements",
        symbol: "LPBADGE",
        abi: "LearnPathBadge.json"
      },
      LearnPathToken: {
        address: tokenContract.address,
        name: "LearnPath Token",
        symbol: "LPTH",
        abi: "LearnPathToken.json"
      }
    }
  };

  // Save to file
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("📄 Deployment info saved to:", deploymentFile);

  // Save ABIs for backend integration
  const artifactsDir = path.join(__dirname, '../artifacts/contracts');
  const backendAbiDir = path.join(__dirname, '../../backend/contracts');
  
  if (!fs.existsSync(backendAbiDir)) {
    fs.mkdirSync(backendAbiDir, { recursive: true });
  }

  // Copy Badge ABI
  const badgeArtifact = require(path.join(artifactsDir, 'LearnPathBadge.sol/LearnPathBadge.json'));
  fs.writeFileSync(
    path.join(backendAbiDir, 'LearnPathBadge.json'),
    JSON.stringify({ abi: badgeArtifact.abi, address: badgeContract.address }, null, 2)
  );

  // Copy Token ABI
  const tokenArtifact = require(path.join(artifactsDir, 'LearnPathToken.sol/LearnPathToken.json'));
  fs.writeFileSync(
    path.join(backendAbiDir, 'LearnPathToken.json'),
    JSON.stringify({ abi: tokenArtifact.abi, address: tokenContract.address }, null, 2)
  );

  console.log("📄 ABIs copied to backend/contracts/\n");

  // Print verification commands
  if (networkName === "mumbai" || networkName === "polygon") {
    console.log("🔍 Verify contracts with these commands:\n");
    console.log(`npx hardhat verify --network ${networkName} ${badgeContract.address} "LearnPath Achievements" "LPBADGE" "ipfs://QmLearnPathContractMetadata/"`);
    console.log(`npx hardhat verify --network ${networkName} ${tokenContract.address}\n`);
  }

  // Print summary
  console.log("=" .repeat(70));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(70));
  console.log(`
📋 Summary:
   Network: ${networkName}
   Chain ID: ${deploymentInfo.chainId}
   
   💎 Badge Contract (ERC-721): ${badgeContract.address}
   🪙 Token Contract (ERC-20): ${tokenContract.address}
   
   🔗 Next Steps:
   1. Update backend .env with contract addresses
   2. Fund the deployer address with tokens for gas
   3. Test minting with scripts/test-mint.js
   4. Configure backend service with private key (secure!)
  `);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

