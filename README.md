# zkVerify Agent Proof Demo

Minimal example exploring how automated agents can prove authorization using zero-knowledge proofs and zkVerify.

As agentic systems become more autonomous, software increasingly triggers actions such as publishing content, executing workflows, or interacting with smart contracts.

Instead of trusting that the correct agent performs these actions, a system could require a **cryptographic proof of authorization**.

```
Agent
 │
 ▼
Circom Circuit
 │
 ▼
Groth16 Proof (snarkjs)
 │
 ▼
zkVerify Volta
 │
 ▼
Aggregation (Merkle Tree)
 │
 ▼
Ethereum Sepolia
 │
 ▼
Authorized action executed
```

---

## Example Use Case

In automated content pipelines, multiple agents may participate in the process:

```
Research Agent → Writing Agent → Editing Agent → Publishing Agent
```

The publishing step is critical. Instead of trusting the agent identity, the publishing service could require a **proof that the agent belongs to the authorized publisher set**.

This demo explores how such an authorization proof could be generated and verified using zkVerify.

---

## Stack

| Component | Technology |
|-----------|-----------|
| Circuit Language | Circom 2.1.6 |
| Proof System | Groth16 (bn128 curve) |
| Proving Library | snarkjs |
| Hash Function | Poseidon |
| zkVerify SDK | zkverifyjs |
| Smart Contracts | Solidity 0.8.24 (Hardhat) |
| Target Chain | Ethereum Sepolia |
| zkVerify Network | Volta Testnet |

---

## Deployed Contract

The verifier contract is deployed and verified on Sepolia with **18 successful on-chain proof verifications**.

| | |
|---|---|
| **Contract** | [`0xF1F86d977e787b895D059C65dE649AeF9703902f`](https://sepolia.etherscan.io/address/0xF1F86d977e787b895D059C65dE649AeF9703902f) |
| **VKey Hash** | `0x8aead396c3c6ba98d0fc38d041ed8e744e71957415571ca5990c72c7b4b7e6cf` |
| **Network** | Ethereum Sepolia |
| **Source** | Verified on Etherscan (Solidity 0.8.24) |

> No need to redeploy unless you modify the circuit or contract logic. The existing contract and VKey hash work out of the box.

---

## Requirements

To run the demo you need a wallet with testnet tokens.

> ⚠️ Use a test wallet only. Never commit your private key.

### 1. Wallet

Add your wallet credentials to the `.env` file:

```
TESTNET_PRIVATE_KEY=0x...         # Sepolia transactions
ZKVERIFY_SEED_PHRASE="word1 ..."  # zkVerify Volta submissions
```

### 2. zkVerify Volta Tokens (tVFY)

Required to submit proofs to zkVerify.

Faucet: [faucy.com/zkverify-volta](https://www.faucy.com/zkverify-volta)

### 3. Sepolia ETH

Required for on-chain verification transactions.

Faucet: [sepoliafaucet.com](https://sepoliafaucet.com)

---

## Quick Demo

```bash
npm install
cp .env.example .env
# Fill in ZKVERIFY_SEED_PHRASE and TESTNET_PRIVATE_KEY
```

Then run in sequence:

```bash
# 1. Submit proof to zkVerify Volta and wait for aggregation
npm run zkverify:submit

# 2. Confirm the VKey hash matches the deployed contract
npm run zkverify:get-vkey-hash

# 3. Verify proof inclusion on-chain → verified[signer] = true
npm run zkverify:verify-on-chain
```

See `.env.example` for all required environment variables.

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

## Related Experiments

[OpenClaw Marketing Agent](https://github.com/thomasbln/openclaw-marketing-agent)

[GraphRAG Legal Demo](https://github.com/thomasbln/graphrag-legal-demo)

---

Thomas Rehmer  
Building systems at [awareo](https://awareo.io)
