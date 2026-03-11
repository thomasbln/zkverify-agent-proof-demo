/**
 * Level 2b: Get VKey hash from zkVerify (needed for Level 3 deploy).
 *
 * Uses zkVerify RPC to compute the verification key hash — no registration needed.
 * Requires connection to zkVerify Volta (ZKVERIFY_SEED_PHRASE for session).
 *
 * Run: npx ts-node scripts/zkverify/02b-get-vkey-hash.ts
 *
 * Output: vkey.json with hash, and instruction to add ZKVERIFY_VKEY_HASH to .env
 */

import {
  zkVerifySession,
  Library,
  CurveType,
  ProofType,
} from "zkverifyjs";
import * as fs from "fs";
import * as path from "path";

require("dotenv").config();

const CIRCUITS_DIR = path.join(__dirname, "../../circuits/secret-proof");

async function main() {
  const seedPhrase = process.env.ZKVERIFY_SEED_PHRASE;
  if (!seedPhrase) {
    throw new Error("ZKVERIFY_SEED_PHRASE not set in .env");
  }

  const vk = JSON.parse(
    fs.readFileSync(path.join(CIRCUITS_DIR, "verification_key.json"), "utf8"),
  );

  const session = await zkVerifySession
    .start()
    .Custom({
      websocket: "wss://zkverify-volta-rpc.zkverify.io",
      rpc: "https://zkverify-volta-rpc.zkverify.io",
      network: "Volta",
    })
    .withAccount(seedPhrase);

  try {
    console.log("Fetching VKey hash from zkVerify Volta...");
    const vkHash = await session.getVkHash(
      {
        proofType: ProofType.groth16,
        config: {
          library: Library.snarkjs,
          curve: CurveType.bn128,
        },
      },
      vk,
    );

    const vkeyData = { hash: vkHash };
    const outputPath = path.join(CIRCUITS_DIR, "vkey.json");
    fs.writeFileSync(outputPath, JSON.stringify(vkeyData, null, 2));

    console.log("VKey hash saved to", outputPath);
    console.log("  hash:", vkHash);
    console.log("\nAdd to .env:");
    console.log(`ZKVERIFY_VKEY_HASH=${vkHash}`);
  } finally {
    await session.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
