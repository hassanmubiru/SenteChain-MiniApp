# Quick Reference: Stellar Commands

## Prerequisites Setup

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install --locked soroban-cli

# Verify installations
rustc --version
cargo --version
soroban --version
```

## Keypair Management

```bash
# Generate new testnet keypair
soroban keys generate deployer --network testnet

# Get public key
soroban keys address deployer

# List all keys
soroban keys ls

# Generate for mainnet
soroban keys generate deployer --network mainnet
```

## Account Funding (Testnet Only)

```bash
# Get your public key
export STELLAR_ADDRESS=$(soroban keys address deployer)

# Fund via Friendbot
curl "https://friendbot.stellar.org/?addr=$STELLAR_ADDRESS"

# Or visit directly
https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY
```

## Build & Deploy

```bash
# From project root

# Build Soroban contracts
npm run build:soroban

# Deploy to Stellar (testnet by default)
npm run deploy:stellar

# For mainnet, first update .env
# STELLAR_NETWORK=mainnet
# Then deploy
npm run deploy:stellar
```

## Contract Testing

```bash
# Test token contract
cd soroban_contracts/sente_token
cargo test
cargo test -- --nocapture  # See output

# Test vault contract
cd ../sente_vault
cargo test
cargo test -- --nocapture  # See output
```

## Development

```bash
# Install all dependencies
npm run install:all

# Start backend (terminal 1)
cd backend
npm run dev

# Start frontend (terminal 2)
cd frontend
npm run dev

# Or run both concurrently
npm run dev
```

## Soroban CLI Contract Commands

```bash
# Invoke contract function (read-only)
soroban contract invoke \
  --id CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- function_name \
  --arg1 value1

# Example: Get token balance
soroban contract invoke \
  --id CCXXX... \
  --source deployer \
  --network testnet \
  -- balance \
  --account GXXX...

# Simulate transaction
soroban contract invoke \
  --id CONTRACT_ID \
  --source deployer \
  --network testnet \
  --simulate \
  -- function_name
```

## Useful Stellar Commands

```bash
# Check account balance
soroban config identity address deployer
curl "https://horizon-testnet.stellar.org/accounts/YOUR_PUBLIC_KEY"

# Get contract info
soroban contract info --id CONTRACT_ID --network testnet

# Fetch contract WASM
soroban contract fetch --id CONTRACT_ID --network testnet

# Deploy WASM file directly
soroban contract deploy \
  --wasm soroban_build/sente_token.wasm \
  --source deployer \
  --network testnet
```

## Environment Variables

```bash
# .env file format
STELLAR_NETWORK=testnet                    # or mainnet
STELLAR_SECRET_KEY=SXXX...                 # Your secret key

# Backend
DB_CONNECTION_STRING=mongodb://...
JWT_SECRET=your_secret
PORT=5000

# Frontend (optional)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Network Endpoints

### Testnet
```bash
export HORIZON_URL="https://horizon-testnet.stellar.org"
export SOROBAN_RPC="https://soroban-testnet.stellar.org"
export FRIENDBOT="https://friendbot.stellar.org"
```

### Mainnet
```bash
export HORIZON_URL="https://horizon.stellar.org"
export SOROBAN_RPC="https://soroban-rpc.stellar.org"
```

## Debugging

```bash
# Check contract build output
ls -lh soroban_build/

# Verify WASM files
file soroban_build/*.wasm

# Check frontend config
cat frontend/config/contracts.json

# Test Stellar connection
curl https://horizon-testnet.stellar.org/

# Check Soroban RPC
curl -X POST https://soroban-testnet.stellar.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

## Common Issues & Fixes

### Build fails
```bash
# Update Rust
rustup update

# Clean and rebuild
cd soroban_contracts/sente_token
cargo clean
cargo build --target wasm32-unknown-unknown --release
```

### Deployment fails
```bash
# Check account balance
curl "https://horizon-testnet.stellar.org/accounts/$(soroban keys address deployer)"

# Refund testnet account
curl "https://friendbot.stellar.org/?addr=$(soroban keys address deployer)"

# Check Soroban RPC is up
curl https://soroban-testnet.stellar.org
```

### Frontend connection issues
```bash
# Reinstall Stellar SDK
cd frontend
npm uninstall @stellar/stellar-sdk
npm install @stellar/stellar-sdk

# Clear browser cache
# Reload Freighter extension
```

## Quick Deploy Checklist

- [ ] Rust and Soroban CLI installed
- [ ] Generated Stellar keypair
- [ ] Account funded (testnet) or has XLM (mainnet)
- [ ] `.env` file configured
- [ ] Contracts build successfully: `npm run build:soroban`
- [ ] Contracts deploy successfully: `npm run deploy:stellar`
- [ ] `frontend/config/contracts.json` updated
- [ ] Frontend dependencies installed
- [ ] Freighter wallet installed
- [ ] Application starts: `npm run dev`

## Useful Links

- [Stellar Laboratory](https://laboratory.stellar.org/) - Test transactions
- [Stellar Expert](https://stellar.expert/explorer/testnet) - Block explorer
- [Soroban Docs](https://soroban.stellar.org/docs) - Developer docs
- [Freighter](https://freighter.app/) - Stellar wallet
- [Stellar Discord](https://discord.gg/stellar) - Community support

## Package Scripts

```bash
npm run dev              # Run frontend + backend
npm run dev:frontend     # Run frontend only
npm run dev:backend      # Run backend only
npm run build:soroban    # Build Rust contracts
npm run deploy:stellar   # Deploy to Stellar
npm run install:all      # Install all dependencies
```

## Pro Tips

1. **Always test on testnet first** before deploying to mainnet
2. **Keep your secret keys secure** - never commit them to git
3. **Use Stellar Laboratory** to inspect transactions and accounts
4. **Monitor gas/fees** - Stellar fees are very low but still required
5. **Test with Freighter** before integrating custom wallet solutions
6. **Use Stellar Expert** to verify contract deployments
7. **Join Stellar Discord** for community support and updates

## Emergency Recovery

If something goes wrong:

```bash
# Rebuild everything from scratch
cd /path/to/SenteChain-MiniApp

# Clean all builds
rm -rf soroban_build/
rm -rf node_modules/
rm -rf frontend/node_modules/
rm -rf backend/node_modules/

# Reinstall
npm run install:all

# Rebuild contracts
npm run build:soroban

# Redeploy
npm run deploy:stellar
```

## Production Checklist

Before going to mainnet:

- [ ] All features tested on testnet
- [ ] Security audit completed
- [ ] Mainnet account funded with sufficient XLM
- [ ] `.env` updated to `STELLAR_NETWORK=mainnet`
- [ ] Frontend updated with mainnet endpoints
- [ ] Backup of all secret keys stored securely
- [ ] Monitoring and logging set up
- [ ] Documentation updated for users
