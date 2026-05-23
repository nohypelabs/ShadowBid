import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying ShadowBid with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const ShadowBid = await hre.ethers.getContractFactory("ShadowBid");
  const shadowBid = await ShadowBid.deploy();
  await shadowBid.waitForDeployment();

  const address = await shadowBid.getAddress();
  console.log("ShadowBid deployed to:", address);

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const network = hre.network.name;
  const deployment = {
    network,
    address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
  };

  const deploymentFile = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));
  console.log("Deployment saved to:", deploymentFile);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
