const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying LearnPathBadge contract...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Deploy contract
  const LearnPathBadge = await hre.ethers.getContractFactory("LearnPathBadge");
  const badge = await LearnPathBadge.deploy(
    "LearnPath Badge", // name
    "LPB"              // symbol
  );

  await badge.deployed();

  console.log("✅ LearnPathBadge deployed to:", badge.address);
  console.log("📋 Transaction hash:", badge.deployTransaction.hash);

  // Grant MINTER_ROLE to deployer (already has it from constructor)
  console.log("🔑 MINTER_ROLE already granted to deployer");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: badge.address,
    deployerAddress: deployer.address,
    transactionHash: badge.deployTransaction.hash,
    blockNumber: badge.deployTransaction.blockNumber,
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`💾 Deployment info saved to deployments/${filename}`);

  // Also save latest deployment
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}-latest.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Wait for block confirmations before verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await badge.deployTransaction.wait(6);

    console.log("🔍 Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: badge.address,
        constructorArguments: ["LearnPath Badge", "LPB"],
      });
      console.log("✅ Contract verified successfully");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  console.log("\n📄 Contract ABI location:");
  console.log("artifacts/contracts/LearnPathBadge.sol/LearnPathBadge.json");
  
  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
