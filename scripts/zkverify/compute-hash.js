#!/usr/bin/env node
/**
 * Computes Poseidon hash for SecretProof circuit input.
 * Use buildPoseidonReference (not buildPoseidon) - it matches circomlib circuit.
 *
 * Usage: node compute-hash.js [secret]
 * Example: node compute-hash.js 12345
 */

const { buildPoseidonReference } = require("circomlibjs");

async function main() {
  const secret = process.argv[2] || "12345";
  const poseidon = await buildPoseidonReference();
  const hash = poseidon([BigInt(secret)]);
  const hashStr = poseidon.F.toString(poseidon.F.e(hash), 10);
  console.log(`Poseidon hash for secret "${secret}":`);
  console.log(hashStr);
}

main().catch(console.error);
