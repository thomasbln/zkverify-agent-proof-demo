/**
 * Level 3: On-chain verification of zkVerify proof.
 *
 * Prerequisites:
 * - ZKVERIFY_TEST_CONTRACT in .env (deployed contract address)
 * - aggregation.json, public.json in circuits/secret-proof/
 *
 * Run: npx hardhat run scripts/zkverify/04-verify-on-chain.ts --network sepolia
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

require("dotenv").config();

const CIRCUITS_DIR = path.join(__dirname, "../../circuits/secret-proof");

async function main() {
  const contractAddress = process.env.ZKVERIFY_TEST_CONTRACT;
  if (!contractAddress) {
    throw new Error(
      "ZKVERIFY_TEST_CONTRACT not set in .env. Deploy first: npm run zkverify:deploy",
    );
  }

  const aggregation = JSON.parse(
    fs.readFileSync(path.join(CIRCUITS_DIR, "aggregation.json"), "utf8"),
  );
  const publicSignals = JSON.parse(
    fs.readFileSync(path.join(CIRCUITS_DIR, "public.json"), "utf8"),
  );
  const hash = publicSignals[0];

  const contract = await ethers.getContractAt(
    "ZkVerifyTest",
    contractAddress,
  );

  console.log("Calling verifyProof...");
  console.log("  hash:", hash);
  console.log("  aggregationId:", aggregation.aggregationId);
  console.log("  domainId:", aggregation.domainId);
  console.log("  merklePath length:", aggregation.proof?.length ?? 0);
  console.log("  numberOfLeaves:", aggregation.numberOfLeaves);
  console.log("  leafIndex:", aggregation.leafIndex);

  const tx = await contract.verifyProof(
    hash,
    aggregation.aggregationId,
    aggregation.domainId,
    aggregation.proof ?? [],
    aggregation.numberOfLeaves,
    aggregation.leafIndex,
  );
  const receipt = await tx.wait();
  console.log("Transaction confirmed:", receipt?.hash);

  const [signer] = await ethers.getSigners();
  const isVerified = await contract.verified(signer.address);
  console.log("Verified:", isVerified);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
