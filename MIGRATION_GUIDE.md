# Migration from Base to Stellar - Technical Guide

## Overview

This document outlines the technical changes made during the migration from Base (EVM) to Stellar (Soroban).

## Key Changes Summary

### 1. Smart Contracts

**Before (Base - Solidity)**
- Language: Solidity 0.8.20
- Location: `smart_contracts/`
- Compilation: Hardhat
- Standard: ERC-20

**After (Stellar - Rust)**
- Language: Rust (Soroban SDK 21.7.0)
- Location: `soroban_contracts/`
- Compilation: Cargo + Soroban CLI
- Standard: Custom Soroban token

### 2. Wallet Integration

| Feature | Base | Stellar |
|---------|------|---------|
| Wallet | MetaMask | Freighter |
| Address Format | 0x... (40 chars) | G... (56 chars) |
| Connection API | `window.ethereum` | `window.freighter` |
| Signature | ECDSA | Ed25519 |

### 3. SDK & Libraries

**Removed:**
- ethers.js
- @openzeppelin/contracts
- Hardhat toolbox

**Added:**
- @stellar/stellar-sdk
- Rust/Cargo toolchain
- Soroban CLI

### 4. Transaction Model

#### Base (EVM)
```javascript
// Approve + Transfer pattern
await token.approve(vault, amount);
await vault.deposit(amount);
```

#### Stellar (Soroban)
```javascript
// Direct invocation with authorization
const contract = new StellarSdk.Contract(address);
const op = contract.call('deposit', [userParam, amountParam]);
// Sign and submit
```

## File Changes

### New Files
- `soroban_contracts/sente_token/src/lib.rs` - Token contract (Rust)
- `soroban_contracts/sente_vault/src/lib.rs` - Vault contract (Rust)
- `soroban_contracts/Cargo.toml` - Rust workspace config
- `stellar_deploy/build-contracts.js` - Build script
- `stellar_deploy/deploy.js` - Deployment script
- `frontend/utils/stellarConfig.js` - Stellar network config
- `frontend/utils/stellarContract.js` - Contract interaction layer
- `STELLAR_SETUP.md` - Setup documentation

### Modified Files
- `package.json` - Updated scripts and dependencies
- `frontend/utils/connectWallet.js` - Changed from MetaMask to Freighter
- `README.md` - Updated documentation
- `hardhat.config.js` - Added deprecation notice

### Preserved Files (No Changes Needed)
- All UI components in `frontend/components/`
- All pages in `frontend/pages/`
- Backend files in `backend/`
- Styling in `frontend/styles/`

## Contract Function Mapping

### SenteToken

| Solidity | Soroban (Rust) | Changes |
|----------|----------------|---------|
| `constructor(uint256)` | `initialize(admin, name, symbol, decimals, supply)` | More parameters |
| `claimFaucet()` | `claim_faucet(claimer)` | Requires claimer address |
| `transfer(address, uint256)` | `transfer(from, to, amount)` | Requires from address |
| `approve(address, uint256)` | `approve(from, spender, amount)` | Requires from address |
| `balanceOf(address)` | `balance(account)` | Same logic |
| `canClaimFaucet(address)` | `can_claim_faucet(user)` | Same logic |

### SenteVault

| Solidity | Soroban (Rust) | Changes |
|----------|----------------|---------|
| `constructor(address)` | `initialize(admin, token_contract)` | Requires admin |
| `deposit(uint256)` | `deposit(user, amount)` | Requires user address |
| `withdraw(uint256)` | `withdraw(user, amount)` | Requires user address |
| `transfer(address, uint256)` | `transfer(from, to, amount)` | Explicit from |
| `saveToVault(uint256, uint256)` | `save_to_vault(user, amount, days)` | Duration in days |
| `balances(address)` | `balance(user)` | Same concept |
| `savingsBalances(address)` | `savings_balance(user)` | Same concept |
| `unlockTime(address)` | `unlock_time(user)` | Returns ledger number |

## Time Handling

### Base (EVM)
- Uses Unix timestamps (seconds)
- `block.timestamp`
- Human-readable

### Stellar (Soroban)
- Uses ledger sequence numbers
- `env.ledger().sequence()`
- ~5 seconds per ledger
- 1 day ≈ 17,280 ledgers

**Conversion:**
```rust
const DAY_IN_LEDGERS: u64 = 17280;
let unlock_ledger = current_ledger + (days * DAY_IN_LEDGERS);
```

## Authorization Model

### Base (EVM)
```solidity
// msg.sender is implicit
function transfer(address to, uint256 amount) external {
    // msg.sender is the caller
}
```

### Stellar (Soroban)
```rust
// Explicit authorization required
pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
    from.require_auth(); // Explicit check
}
```

## Network Configuration

### Base Sepolia
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- Gas: ETH

### Stellar Testnet
- Network: Test SDF Network
- Horizon: https://horizon-testnet.stellar.org
- Soroban RPC: https://soroban-testnet.stellar.org
- Explorer: https://stellar.expert
- Fees: XLM

## Deployment Process

### Base
```bash
npm run compile  # Compile Solidity
npm run deploy   # Deploy via Hardhat
```

### Stellar
```bash
npm run build:soroban    # Build Rust → WASM
npm run deploy:stellar   # Deploy WASM to Stellar
```

## Testing

### Base
```bash
npx hardhat test  # Solidity tests
```

### Stellar
```bash
cd soroban_contracts/sente_token
cargo test  # Rust tests

cd ../sente_vault
cargo test
```

## Data Types

### Numbers

| Type | Base (Solidity) | Stellar (Rust) |
|------|-----------------|----------------|
| Token amounts | `uint256` | `i128` |
| Decimals | `uint8` | `u32` |
| Time | `uint256` (seconds) | `u64` (ledgers) |
| Lock duration | `uint256` (seconds) | `u32` (days) |

### Addresses

| Network | Format | Length | Example |
|---------|--------|--------|---------|
| Base | 0x... | 42 chars | 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb |
| Stellar | G... | 56 chars | GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H |

## Error Handling

### Base
```solidity
require(condition, "Error message");
revert("Error message");
```

### Stellar
```rust
if !condition {
    panic!("Error message");
}
```

## Events

### Base
```solidity
event Deposited(address indexed user, uint256 amount, uint256 timestamp);
emit Deposited(msg.sender, amount, block.timestamp);
```

### Stellar
```rust
env.events().publish(
    (symbol_short!("deposit"), user),
    amount
);
```

## Frontend Integration Changes

### Initialization

**Base:**
```javascript
import { ethers } from 'ethers';
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
```

**Stellar:**
```javascript
import * as StellarSdk from '@stellar/stellar-sdk';
const server = new StellarSdk.Horizon.Server(HORIZON_URL);
const publicKey = await window.freighter.getPublicKey();
```

### Transaction Signing

**Base:**
```javascript
const tx = await contract.deposit(amount);
await tx.wait();
```

**Stellar:**
```javascript
const tx = buildTransaction(operation);
const signedXdr = await window.freighter.signTransaction(tx.toXDR());
const result = await server.submitTransaction(signedXdr);
```

## Performance Comparison

| Metric | Base Sepolia | Stellar Testnet |
|--------|--------------|-----------------|
| Block/Ledger Time | ~2 seconds | ~5 seconds |
| Finality | ~12 seconds | ~5 seconds |
| Gas/Fee Model | Gas price × gas used | Fixed fee per operation |
| Typical Fee | ~$0.01-0.10 | ~$0.0001 |

## Resources

### Stellar Development
- [Soroban Docs](https://soroban.stellar.org/docs)
- [Stellar SDK](https://github.com/stellar/js-stellar-sdk)
- [Rust Book](https://doc.rust-lang.org/book/)

### Tools
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Stellar Expert](https://stellar.expert/)
- [Freighter Wallet](https://freighter.app/)

## Migration Checklist

- [x] Install Rust and Soroban CLI
- [x] Create Soroban smart contracts
- [x] Update frontend SDK to Stellar
- [x] Replace MetaMask with Freighter
- [x] Update network configuration
- [x] Create deployment scripts
- [x] Update documentation
- [ ] Test all user flows
- [ ] Update UI for Stellar addresses
- [ ] Add Stellar-specific error handling
- [ ] Deploy to Stellar testnet
- [ ] Conduct security audit

## Next Steps

1. **Test Components**: Update and test all React components with Stellar integration
2. **Error Handling**: Add Stellar-specific error messages
3. **UI Updates**: Format Stellar addresses properly in UI
4. **Transaction History**: Implement transaction history using Horizon API
5. **Production Deployment**: Deploy to Stellar mainnet when ready
