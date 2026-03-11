/**
 * Level 2: Submit proof to zkVerify Volta testnet and retrieve aggregation data.
 *
 * Prerequisites:
 * - ZKVERIFY_SEED_PHRASE in .env (12-word Substrate seed phrase)
 * - VFY tokens from https://www.faucy.com/zkverify-volta
 * - Level 1 artifacts: proof.json, public.json, verification_key.json
 *
 * Run: npx ts-node scripts/zkverify/02-submit-to-zkverify.ts
 */

import {
  zkVerifySession,
  Library,
  CurveType,
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

  // Load artifacts
  const vk = JSON.parse(
    fs.readFileSync(path.join(CIRCUITS_DIR, "verification_key.json"), "utf8"),
  );
  const proof = JSON.parse(
    fs.readFileSync(path.join(CIRCUITS_DIR, "proof.json"), "utf8"),
  );
  const publicSignals = JSON.parse(
    fs.readFileSync(path.join(CIRCUITS_DIR, "public.json"), "utf8"),
  );

  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 1) {
      console.log(`\nRetry attempt ${attempt}/${MAX_RETRIES}...`);
      await new Promise((r) => setTimeout(r, 5000)); // wait before retry
    }

    // New session per attempt (connection may be dead after disconnect)
    // Using official zkVerify Testnet RPC from docs
    const session = await zkVerifySession
      .start()
      .Custom({
        websocket: "wss://zkverify-volta-rpc.zkverify.io",
        rpc: "https://zkverify-volta-rpc.zkverify.io",
        network: "Volta",
      })
      .withAccount(seedPhrase);

    try {
      // Submit proof
      console.log("Submitting proof to zkVerify Volta...");
      const { transactionResult } = await session
        .verify()
        .groth16({ library: Library.snarkjs, curve: CurveType.bn128 })
        .execute({
          proofData: { vk, proof, publicSignals },
          domainId: 0,
        });

      // Wait for transaction result (statement, aggregationId, domainId)
      const txInfo = await transactionResult;
      const statement = txInfo.statement;
      const aggregationId = txInfo.aggregationId;
      const domainId = txInfo.domainId;

      if (!statement || aggregationId === undefined || domainId === undefined) {
        throw new Error(
          `Missing tx info: statement=${!!statement}, aggregationId=${aggregationId}, domainId=${domainId}`,
        );
      }

      console.log("Proof included in block!");
      console.log("  statement:", statement);
      console.log("  aggregationId:", aggregationId);
      console.log("  domainId:", domainId);

      // Wait for aggregation (can take several minutes)
      console.log("Waiting for aggregation (this may take minutes)...");
      const receipt = await session.waitForAggregationReceipt(
        domainId,
        aggregationId,
        900_000, // 15 min timeout
      );

      // Get Merkle path for on-chain verification
      const statementPath = await session.getAggregateStatementPath(
        receipt.blockHash,
        domainId,
        aggregationId,
        statement,
      );

      const aggregation = {
        ...statementPath,
        domainId,
        aggregationId,
      };

      const outputPath = path.join(CIRCUITS_DIR, "aggregation.json");
      fs.writeFileSync(outputPath, JSON.stringify(aggregation, null, 2));
      console.log("Aggregation data saved to", outputPath);
      console.log(aggregation);
      await session.close();
      return; // success
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRetryable =
        msg.includes("Abnormal Closure") ||
        msg.includes("No response received") ||
        msg.includes("Timeout exceeded") ||
        msg.includes("disconnected");

      await session.close();

      if (isRetryable && attempt < MAX_RETRIES) {
        console.warn(`\nConnection issue, will retry: ${msg}`);
      } else {
        throw err;
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
