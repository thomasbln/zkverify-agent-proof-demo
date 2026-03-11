/**
 * Level 3: Deploy ZkVerifyTest contract to Sepolia.
 *
 * Prerequisites:
 * - ZKVERIFY_VKEY_HASH in .env (run 02b-get-vkey-hash.ts first)
 * - TESTNET_PRIVATE_KEY, ALCHEMY_TESTNET_RPC_URL
 * - Sepolia ETH for gas
 *
 * Run: npx hardhat run scripts/zkverify/03-deploy-verifier.ts --network sepolia
 */

import { ethers } from "hardhat";

const ZKVERIFY_PROXY_SEPOLIA =
  "0xEA0A0f1EfB1088F4ff0Def03741Cb2C64F89361E";

async function main() {
  const VKEY_HASH = process.env.ZKVERIFY_VKEY_HASH;
  if (!VKEY_HASH) {
    throw new Error(
      "ZKVERIFY_VKEY_HASH not set in .env. Run: npm run zkverify:get-vkey-hash",
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  console.log("Deploying ZkVerifyTest...");
  const ZkVerifyTest = await ethers.getContractFactory("ZkVerifyTest");
  const contract = await ZkVerifyTest.deploy(
    ZKVERIFY_PROXY_SEPOLIA,
    VKEY_HASH,
  );
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("ZkVerifyTest deployed:", address);
  console.log(`Etherscan: https://sepolia.etherscan.io/address/${address}`);
  console.log("\nAdd to .env:");
  console.log(`ZKVERIFY_TEST_CONTRACT=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
