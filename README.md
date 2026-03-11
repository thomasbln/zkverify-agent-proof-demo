# zkVerify Agent Proof Demo

Minimal example exploring how automated agents can prove authorization using zero-knowledge proofs and zkVerify.

As agentic systems become more autonomous, software increasingly triggers actions such as publishing content, executing workflows, or interacting with smart contracts.

Instead of trusting that the correct agent performs these actions, a system could require a **cryptographic proof of authorization**.

This repository demonstrates a simple pattern:

```
Agent → generates a proof of authorization → proof verified via zkVerify → action executed
```

---

## Architecture

```
Agent
↓
Generate ZK Proof (Circom + snarkjs)
↓
Submit proof to zkVerify
↓
zkVerify aggregates verified proofs
↓
Smart contract verifies inclusion
↓
Authorized action executed
```

---

## Example Use Case

In automated content pipelines, multiple agents may participate in the process:

```
Research Agent
↓
Writing Agent
↓
Editing Agent
↓
Publishing Agent
```

The publishing step is critical. Instead of trusting the agent identity, the publishing service could require a **proof that the agent belongs to the authorized publisher set**.

This demo explores how such an authorization proof could be generated and verified using zkVerify.

---

## Stack

- [Circom](https://docs.circom.io)
- [snarkjs](https://github.com/iden3/snarkjs)
- [zkVerify](https://zkverify.io)
- [Solidity](https://soliditylang.org) / [Hardhat](https://hardhat.org)

---

## Repository Structure

```
zkverify-agent-proof-demo/
├── circuits/
│   └── secret-proof/
│       ├── circuit.circom              # Circom authorization circuit
│       └── input.json                  # Example input
├── contracts/
│   └── zkverify/
│       ├── interfaces/
│       │   └── IVerifyProofAggregation.sol
│       └── ZkVerifyTest.sol            # On-chain verifier
├── scripts/
│   └── zkverify/
│       ├── compute-hash.js             # Poseidon hash helper
│       ├── 02-submit-to-zkverify.ts    # Submit proof to zkVerify Volta
│       ├── 02b-get-vkey-hash.ts        # Get VKey hash
│       ├── 03-deploy-verifier.ts       # Deploy contract to Sepolia
│       └── 04-verify-on-chain.ts       # On-chain verification
├── .env.example
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

---

## Setup

```bash
npm install
cp .env.example .env
# Fill in your seed phrase, private key, and RPC URL
```

See `.env.example` for required environment variables.

---

## Related Experiments

[OpenClaw Marketing Agent](https://github.com/thomasbln/openclaw-marketing-agent)

[GraphRAG Legal Demo](https://github.com/thomasbln/graphrag-legal-demo)

---

Thomas Rehmer  
Building systems at [awareo](https://awareo.io)
