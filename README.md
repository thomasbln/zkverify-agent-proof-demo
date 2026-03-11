# zkVerify Awareo Demo — Proof of Liveness with Groth16

> Zero-knowledge proof integration for [Awareo](https://awareo.io) using [zkVerify](https://zkverify.io) — from local circuit to on-chain verification.

## What is this?

Awareo is a digital legacy and life-organizing platform. We use zero-knowledge proofs to implement **Proof of Liveness** — a mechanism that cryptographically proves a user is alive and active, without revealing any private data.

This repository demonstrates our 3-level zkVerify integration:

```
Level 1 (Local)           Level 2 (zkVerify Volta)        Level 3 (Ethereum Sepolia)
───────────────           ──────────────────────          ─────────────────────────
Circom Circuit            Proof Submission                On-Chain Verification
  ↓                         ↓                               ↓
Witness + Proof           Aggregation + Merkle Tree       ZkVerifyTest Contract
  ↓                         ↓                               ↓
snarkjs verify (local)    aggregation.json                verifyProofAggregation()
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Circuit Language | Circom 2.1.6 |
| Proof System | Groth16 (bn128 curve) |
| Proving Library | snarkjs |
| Hash Function | Poseidon |
| zkVerify SDK | zkverifyjs v2.1.0 |
| Smart Contracts | Solidity 0.8.20 (Hardhat) |
| Target Chain | Ethereum Sepolia |
| zkVerify Network | Volta Testnet |

## Architecture

### Level 1 — Local Proof Generation

The circuit (`circuits/secret-proof/circuit.circom`) implements a Proof-of-Knowledge: it proves the prover knows the preimage of a Poseidon hash without revealing it.

```circom
template SecretProof() {
    signal input secret;    // PRIVATE
    signal input hash;      // PUBLIC: Poseidon(secret)

    component hasher = Poseidon(1);
    hasher.inputs[0] <== secret;
    hash === hasher.out;
}
```

**Flow:** `input.json` → Witness (secret, stays local) → `proof.json` + `public.json`

### Level 2 — zkVerify Submission & Aggregation

Using zkverifyjs, we submit the Groth16 proof to zkVerify Volta. zkVerify batches proofs into Merkle trees for cost-efficient on-chain verification.

**Flow:** Submit proof → Wait for aggregation → Receive `aggregation.json` (Merkle root, path, leaf index)

### Level 3 — On-Chain Verification

`ZkVerifyTest.sol` on Sepolia reconstructs the Merkle leaf and calls the zkVerify Proxy contract to verify the aggregation proof.

- zkVerify Proxy (Sepolia): [`0xEA0A0f1EfB1088F4ff0Def03741Cb2C64F89361E`](https://sepolia.etherscan.io/address/0xEA0A0f1EfB1088F4ff0Def03741Cb2C64F89361E)
- Leaf construction with Groth16 endianness conversion
- On success: `verified[msg.sender] = true`

### Deployed Contract

The `ZkVerifyTest` contract is deployed and verified on Sepolia with **18 successful on-chain proof verifications**:

- **Contract:** [`0xF1F86d977e787b895D059C65dE649AeF9703902f`](https://sepolia.etherscan.io/address/0xF1F86d977e787b895D059C65dE649AeF9703902f)
- **VKey Hash:** `0x8aead396c3c6ba98d0fc38d041ed8e744e71957415571ca5990c72c7b4b7e6cf`
- **Source Code:** Verified on Etherscan (Solidity 0.8.24)
- **Transactions:** 18 `verifyProof` calls (Feb 12–16, 2026)

## Repository Structure

```
demo-zkverify-awareo/
├── circuits/
│   └── secret-proof/
│       ├── circuit.circom              # Circom SecretProof circuit
│       └── input.json                  # Example input (secret + Poseidon hash)
├── contracts/
│   └── zkverify/
│       ├── interfaces/
│       │   └── IVerifyProofAggregation.sol  # zkVerify Proxy interface
│       └── ZkVerifyTest.sol            # On-chain verifier contract
├── scripts/
│   └── zkverify/
│       ├── compute-hash.js             # Poseidon hash helper
│       ├── 02-submit-to-zkverify.ts    # Level 2: Submit proof to Volta
│       ├── 02b-get-vkey-hash.ts        # Level 2: Get VKey hash
│       ├── 03-deploy-verifier.ts       # Level 3: Deploy contract
│       └── 04-verify-on-chain.ts       # Level 3: On-chain verification
├── .env.example
├── hardhat.config.ts
├── package.json
└── README.md
```

## Setup

### Prerequisites

- Node.js v18+
- [Circom](https://docs.circom.io/getting-started/installation/) (Rust compiler)
- snarkjs (`npm install -g snarkjs`)
- zkVerify Volta account with tVFY tokens ([Faucet](https://www.faucy.com/zkverify-volta))
- Sepolia ETH ([Faucet](https://sepoliafaucet.com))

### Install

```bash
npm install
cp .env.example .env
# Fill in your seed phrase, private key, and RPC URL
```

### Level 1 — Compile Circuit & Generate Proof

```bash
# Compute Poseidon hash for input.json (optional, already included)
node scripts/zkverify/compute-hash.js 12345

cd circuits/secret-proof

# Compile circuit
circom circuit.circom --r1cs --wasm --sym -o build/

# Trusted Setup (bn128, Powers of Tau)
wget https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_12.ptau -O pot12_final.ptau
snarkjs groth16 setup build/circuit.r1cs pot12_final.ptau circuit_0000.zkey
snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="test" -v
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

# Generate Witness & Proof
cd build/circuit_js
node generate_witness.js circuit.wasm ../../input.json witness.wtns
cd ../..
snarkjs groth16 prove circuit_final.zkey build/circuit_js/witness.wtns proof.json public.json

# Verify locally
snarkjs groth16 verify verification_key.json public.json proof.json
# Expected: [INFO] snarkJS: OK!
```

### Level 2 — Submit to zkVerify

```bash
# Submit proof to Volta and wait for aggregation
npm run zkverify:submit

# Get VKey hash (needed for contract deployment)
npm run zkverify:get-vkey-hash
# → Add ZKVERIFY_VKEY_HASH to .env
```

### Level 3 — Deploy & Verify On-Chain

```bash
# Deploy ZkVerifyTest to Sepolia
npm run zkverify:deploy
# → Add ZKVERIFY_TEST_CONTRACT to .env

# Verify proof on-chain
npm run zkverify:verify-on-chain
# → verified[signer] = true
```

## Context

This demo is part of a larger Web2 application that uses zkVerify for privacy-preserving user verification. The full integration runs server-side, invisible to end users.

## References

- [zkVerify Documentation](https://docs.zkverify.io)
- [zkVerifyJS Getting Started](https://docs.zkverify.io/overview/getting-started/zkverify-js)
- [zkVerify Smart Contract Verification](https://docs.zkverify.io/overview/getting-started/smart-contract)
- [zkVerify Contract Addresses](https://docs.zkverify.io/overview/contract-addresses)
- [Circom Documentation](https://docs.circom.io)
- [snarkjs](https://github.com/iden3/snarkjs)
- [zkVerify Tutorials](https://github.com/zkVerify/tutorials)

## License

MIT — awareo UG
