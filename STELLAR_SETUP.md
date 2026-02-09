# SenteChain on Stellar - Setup Guide

## Overview
SenteChain has been migrated from Base (EVM) to Stellar blockchain using Soroban smart contracts. This guide will help you set up and deploy the project.

## Prerequisites

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 2. Add WASM Target
```bash
rustup target add wasm32-unknown-unknown
```

### 3. Install Soroban CLI
```bash
cargo install --locked soroban-cli
```

Verify installation:
```bash
soroban --version
```

### 4. Install Freighter Wallet
- Visit https://freighter.app
- Install the browser extension
- Create or import a Stellar account

## Project Setup

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:

```env
# Stellar Configuration
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=S...  # Your Stellar secret key

# For testnet, you can generate a keypair with:
# soroban keys generate deployer --network testnet
# soroban keys address deployer
```

### 3. Fund Your Testnet Account
```bash
# Get your public key
soroban keys address deployer

# Fund via Friendbot (testnet only)
curl "https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY"
```

## Build and Deploy Contracts

### 1. Build Soroban Contracts
```bash
npm run build:soroban
```

This will:
- Compile the Rust contracts to WASM
- Optimize the WASM binaries
- Output to `soroban_build/` directory

### 2. Deploy to Stellar Testnet
```bash
npm run deploy:stellar
```

This will:
- Deploy SenteToken contract
- Deploy SenteVault contract
- Initialize both contracts
- Save deployment info to `frontend/config/contracts.json`

### 3. Start the Application
```bash
npm run dev
```

## Smart Contracts

### SenteToken (Token Contract)
- Located: `soroban_contracts/sente_token/`
- Language: Rust (Soroban SDK)
- Features:
  - ERC20-like token functionality
  - 6 decimals (USDT standard)
  - Faucet system (100 tokens per day)
  - Transfer, approve, and allowance functions

### SenteVault (Vault Contract)
- Located: `soroban_contracts/sente_vault/`
- Language: Rust (Soroban SDK)
- Features:
  - Deposit and withdraw
  - Internal transfers
  - Savings vault with time locks
  - Balance tracking

## Development Workflow

### Modify Contracts
1. Edit Rust files in `soroban_contracts/`
2. Rebuild: `npm run build:soroban`
3. Redeploy: `npm run deploy:stellar`

### Test Contracts
```bash
cd soroban_contracts/sente_token
cargo test

cd ../sente_vault
cargo test
```

## Frontend Integration

The frontend has been updated to work with Stellar:

### Key Changes
1. **Wallet**: MetaMask → Freighter
2. **SDK**: ethers.js → @stellar/stellar-sdk
3. **Network Config**: `frontend/utils/stellarConfig.js`
4. **Contract Utils**: `frontend/utils/stellarContract.js`
5. **Wallet Connection**: `frontend/utils/connectWallet.js`

### Using Freighter in the App
1. Install Freighter extension
2. Create/import account
3. Connect wallet in the app
4. Account auto-funded on testnet (if needed)

## Stellar Network Details

### Testnet
- Network: `Test SDF Network ; September 2015`
- Horizon URL: `https://horizon-testnet.stellar.org`
- Soroban RPC: `https://soroban-testnet.stellar.org`
- Friendbot: `https://friendbot.stellar.org`

### Mainnet (for production)
- Network: `Public Global Stellar Network ; September 2015`
- Horizon URL: `https://horizon.stellar.org`
- Soroban RPC: `https://soroban-rpc.stellar.org`

## Troubleshooting

### Contract Build Fails
- Ensure Rust is installed: `rustc --version`
- Ensure WASM target: `rustup target list | grep wasm32`
- Check Soroban CLI: `soroban --version`

### Deployment Fails
- Check account balance: Must have XLM for fees
- Verify network: Testnet vs Mainnet
- Check secret key in `.env`

### Wallet Connection Issues
- Ensure Freighter is installed
- Check network in Freighter (testnet/mainnet)
- Try refreshing the page

## Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Freighter Wallet](https://freighter.app/)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Stellar Expert Explorer](https://stellar.expert/)

## Architecture Changes from Base

| Component | Base (EVM) | Stellar (Soroban) |
|-----------|------------|-------------------|
| Language | Solidity | Rust |
| Wallet | MetaMask | Freighter |
| SDK | ethers.js | stellar-sdk |
| Gas Token | ETH | XLM |
| Network | Base Sepolia | Stellar Testnet |
| Contract Standard | ERC-20 | Custom Soroban |

## Support

For issues or questions:
1. Check Stellar Discord: https://discord.gg/stellar
2. Soroban Docs: https://soroban.stellar.org
3. Project Issues: [GitHub Issues]
