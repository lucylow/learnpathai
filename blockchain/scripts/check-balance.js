const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();

  console.log("\n💰 Wallet Balance Check\n");
  console.log("Address:", deployer.address);
  console.log("Balance:", ethers.utils.formatEther(balance), "ETH");
  console.log("Network:", network.name);
  console.log();

  if (balance.eq(0)) {
    console.log("⚠️  Wallet has no funds!");
    console.log("\n📍 Get test funds:");
    if (network.name === "mumbai") {
      console.log("   Mumbai faucet: https://faucet.polygon.technology");
    } else if (network.name === "goerli") {
      console.log("   Goerli faucet: https://goerlifaucet.com");
    }
    console.log();
  } else {
    console.log("✅ Wallet funded and ready for deployment!\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

