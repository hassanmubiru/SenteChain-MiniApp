# SenteChain MiniApp - Agent Skill

## Overview

SenteChain MiniApp is a Web3 decentralized application built on the **Celo blockchain** that enables Ugandans and other users to send, receive, and save stablecoins (sUSDT) easily without requiring crypto knowledge.

## Tech Stack

- **Blockchain**: Celo (Alfajores Testnet / Mainnet)
- **Smart Contracts**: Solidity 0.8.20
- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Node.js, Express.js
- **Web3 Library**: ethers.js v6
- **Wallet**: MetaMask
- **Development**: Hardhat

## Project Structure

### Frontend (`frontend/`)
- `pages/` - Next.js pages (index, dashboard)
- `components/` - React components (WalletCard, SendForm, SavingsVault, etc.)
- `utils/` - Utility functions
  - `contract.js` - Smart contract interactions using ethers.js
  - `networkConfig.js` - Celo network configuration
  - `connectWallet.js` - MetaMask wallet connection
- `config/` - Contract ABIs and deployed addresses

### Smart Contracts (`smart_contracts/`)
- `SenteToken.sol` - ERC20 token with faucet functionality
- `SenteVault.sol` - Vault for deposits, transfers, and time-locked savings
- `deploy.js` - Hardhat deployment script

### Backend (`backend/`)
- `server.js` - Express server
- `routes/auth.js` - Authentication routes
- `models/User.js` - User model
- `db.js` - Database connection

## Key Features

1. **Token Faucet**: Users can claim 100 sUSDT every 24 hours on testnet
2. **Peer-to-Peer Transfers**: Instant token transfers between users
3. **Savings Vault**: Lock tokens for 1-365 days with time-based unlocking
4. **MetaMask Integration**: Seamless wallet connection with auto-network switching

## Network Configuration

### Celo Alfajores Testnet
- Chain ID: 44787 (0xAEF3)
- RPC: https://alfajores-forno.celo-testnet.org
- Explorer: https://alfajores.celoscan.io
- Faucet: https://faucet.celo.org/alfajores

### Celo Mainnet
- Chain ID: 42220 (0xA4EC)
- RPC: https://forno.celo.org
- Explorer: https://celoscan.io

## Common Commands

```bash
# Install dependencies
npm run install:all

# Deploy contracts to Celo Alfajores
npx hardhat run smart_contracts/deploy.js --network celoAlfajores

# Deploy contracts to Celo Mainnet
npx hardhat run smart_contracts/deploy.js --network celoMainnet

# Start development servers
npm run dev

# Run tests
npx hardhat test
```

## Smart Contract Functions

### SenteToken
- `balanceOf(address)` - Get token balance
- `transfer(to, amount)` - Transfer tokens
- `approve(spender, amount)` - Approve spending
- `claimFaucet()` - Claim 100 testnet tokens
- `canClaimFaucet(address)` - Check faucet eligibility

### SenteVault
- `deposit(amount)` - Deposit tokens
- `withdraw(amount)` - Withdraw tokens
- `transfer(to, amount)` - Transfer in vault
- `saveToVault(amount, lockDays)` - Lock savings
- `withdrawFromVault(amount)` - Unlock savings
- `balanceOf(user)` - Available balance
- `savingsBalanceOf(user)` - Locked balance
- `getUnlockTime(user)` - Savings unlock time

## Environment Variables

```env
PRIVATE_KEY=your_wallet_private_key
CELO_ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org
CELO_MAINNET_RPC=https://forno.celo.org
```

## Agent Guidelines

When working on this project:

1. **Smart Contracts**: Use Solidity 0.8.20 with OpenZeppelin libraries
2. **Frontend**: Follow React/Next.js best practices with ethers.js v6
3. **Network**: Default to Celo Alfajores for development
4. **Wallet**: Use MetaMask with auto-network switching
5. **Testing**: Write Hardhat tests for contract changes
6. **Security**: Use ReentrancyGuard and access controls
