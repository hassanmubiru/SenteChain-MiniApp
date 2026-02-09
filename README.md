# 💰 SenteChain MiniApp

> A Web3 mini-application built on **Stellar** that allows Ugandans to send, receive, and save stablecoins (USDT) easily — no crypto knowledge required.

![Stellar](https://img.shields.io/badge/Stellar-Testnet-7D00FF?style=for-the-badge&logo=stellar)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Rust](https://img.shields.io/badge/Rust-Soroban-CE422B?style=for-the-badge&logo=rust)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🎯 Overview

SenteChain is a fully functional decentralized application (dApp) that simplifies crypto transactions for everyday users. Built on Stellar Testnet using Soroban smart contracts, it provides:

- **Walletless Login**: Users register with email or phone number
- **Auto-Generated Wallets**: Smart accounts created automatically
- **Instant Transfers**: Send/receive USDT between users with low fees
- **Savings Vault**: Lock tokens for savings with time-based unlocks
- **Mobile-First UI**: Clean, intuitive interface built with TailwindCSS

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15 + React 19 + TailwindCSS
- **Smart Contracts**: Rust (Soroban SDK)
- **Blockchain**: Stellar Testnet
- **Web3 Library**: @stellar/stellar-sdk
- **Wallet**: Freighter
- **Backend**: Node.js/Express
- **Development**: Soroban CLI + Cargo

### Project Structure

```
sentechain-miniapp/
├── frontend/                    # Next.js application
│   ├── pages/
│   │   ├── _app.jsx            # App wrapper with Toaster
│   │   ├── index.jsx           # Landing & login page
│   │   └── dashboard.jsx       # Main dashboard
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── WalletCard.jsx      # Balance display
│   │   ├── SendForm.jsx        # Transfer form
│   │   └── SavingsVault.jsx    # Savings management
│   ├── utils/
│   │   ├── stellarContract.js  # Smart contract interactions
│   │   ├── stellarConfig.js    # Stellar network config
│   │   └── connectWallet.js    # Freighter connection
│   ├── config/
│   │   ├── contracts.json      # Deployed contract addresses
│   └── styles/
│       └── globals.css         # Global styles
├── backend/                     # Express API
│   ├── server.js               # Main server file
│   ├── routes/
│   │   └── auth.js            # Authentication routes
│   ├── models/
│   │   └── User.js            # User model
│   └── db.js                  # Database connection
├── soroban_contracts/           # Rust Soroban contracts
│   ├── sente_token/            # Token contract (sUSDT)
│   │   ├── src/lib.rs         # Token implementation
│   │   └── Cargo.toml         # Rust dependencies
│   ├── sente_vault/            # Vault management
│   │   ├── src/lib.rs         # Vault implementation
│   │   └── Cargo.toml         # Rust dependencies
│   └── Cargo.toml             # Workspace config
├── stellar_deploy/              # Stellar deployment scripts
│   ├── build-contracts.js      # Build Soroban contracts
│   └── deploy.js              # Deploy to Stellar
└── package.json                # Root dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- **Rust and Cargo** ([Install here](https://rustup.rs/))
- **Soroban CLI** (`cargo install --locked soroban-cli`)
- **Freighter Wallet** ([Install here](https://freighter.app))
- Git

### Installation

1. **Clone the repository**

```bash
cd /home/godwin-ofwono/Desktop/BlockChain/SenteChain-MiniApp
```

2. **Install all dependencies**

```bash
npm run install:all
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and configure for Stellar:
```env
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=S...  # Generate with: soroban keys generate deployer --network testnet
```

### 🔧 Development Setup

#### 1. Build Soroban Smart Contracts

```bash
npm run build:soroban
```

This will:
- Compile Rust contracts to WASM
- Optimize WASM binaries
- Output to `soroban_build/` directory

#### 2. Deploy to Stellar Testnet

Make sure your account is funded (automatically via Friendbot on testnet).

```bash
npm run deploy:stellar
```

This will:
- Deploy `SenteToken` contract
- Deploy `SenteVault` contract
- Initialize both contracts
- Save contract addresses to `frontend/config/contracts.json`

#### 3. Start the Backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

#### 4. Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

#### 5. Alternative: Run Both Concurrently

From the root directory:

```bash
npm run dev
```

## 📝 Smart Contracts

### SenteToken (Soroban Token Contract)

Custom token contract with 6 decimals (USDT standard).

**Key Functions:**
- `initialize(admin, name, symbol, decimals, initial_supply)` - Initialize token
- `transfer(from, to, amount)` - Transfer tokens
- `approve(from, spender, amount)` - Approve spending
- `claim_faucet(claimer)` - Get 100 free testnet tokens (once per day)
- `balance(account)` - Check token balance
- `can_claim_faucet(user)` - Check if eligible for faucet

### SenteVault (Soroban Vault Contract)

Manages user deposits, transfers, and time-locked savings.

**Key Functions:**
- `initialize(admin, token_contract)` - Initialize vault
- `deposit(user, amount)` - Deposit tokens to vault
- `withdraw(user, amount)` - Withdraw tokens from vault
- `transfer(from, to, amount)` - Transfer between users in vault
- `save_to_vault(user, amount, lock_duration_days)` - Lock tokens for savings
- `withdraw_from_vault(user, amount)` - Unlock savings (after lock period)
- `balance(user)` - Get available balance
- `savings_balance(user)` - Get locked savings balance
- `total_balance(user)` - Get total balance (available + savings)

## 🎮 Usage Guide

### For Users

1. **Register/Login**
   - Go to `http://localhost:3000`
   - Enter your email or phone number
   - Your wallet is automatically created!

2. **Connect Freighter Wallet**
   - Install Freighter from https://freighter.app
   - Click "Connect Wallet" on the dashboard
   - Approve the connection in Freighter
   - Account auto-funded on Stellar Testnet

3. **Get Test Tokens**
   - Click "Claim 100 sUSDT" button
   - Confirm transaction in Freighter
   - Wait for confirmation (5-10 seconds)

4. **Deposit to Vault**
   - Click "Deposit to Vault"
   - Enter amount
   - Approve in Freighter → Deposit

5. **Send Money**
   - Enter recipient Stellar address
   - Enter amount
   - Click "Send Now"

6. **Save Money**
   - Go to "Savings Vault" tab
   - Select "Lock Savings"
   - Choose amount and lock period (1-365 days)
   - Confirm transaction

### For Developers

#### Testing Contracts

```bash
cd soroban_contracts/sente_token
cargo test

cd ../sente_vault
cargo test
```

#### Building Contracts

```bash
npm run build:soroban
```

#### Deploying to Stellar Mainnet

Update `.env`:
```env
STELLAR_NETWORK=mainnet
STELLAR_SECRET_KEY=S...
```

Then deploy:
```bash
npm run deploy:stellar
```

#### Interacting with Contracts

Use Soroban CLI:

```bash
# Get contract balance
soroban contract invoke \
  --id CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- balance \
  --account YOUR_ADDRESS

# Transfer tokens
soroban contract invoke \
  --id CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- transfer \
  --from YOUR_ADDRESS \
  --to RECIPIENT_ADDRESS \
  --amount 100000000
```

## 🌐 Stellar Network Configuration

### Testnet (Development)
- **Network**: Test SDF Network ; September 2015
- **Horizon URL**: https://horizon-testnet.stellar.org
- **Soroban RPC**: https://soroban-testnet.stellar.org
- **Friendbot**: https://friendbot.stellar.org
- **Currency**: XLM (testnet)
- **Explorer**: https://stellar.expert/explorer/testnet

### Mainnet (Production)
- **Network**: Public Global Stellar Network ; September 2015
- **Horizon URL**: https://horizon.stellar.org
- **Soroban RPC**: https://soroban-rpc.stellar.org
- **Currency**: XLM
- **Explorer**: https://stellar.expert/explorer/public

## 📱 Features

### ✅ Implemented

- [x] Email/phone registration
- [x] Auto-generated wallets
- [x] Freighter wallet integration
- [x] Token faucet (100 sUSDT/day on testnet)
- [x] Vault deposits/withdrawals
- [x] Instant peer-to-peer transfers
- [x] Savings vault with time locks (1-365 days)
- [x] Real-time balance updates
- [x] Transaction notifications
- [x] Mobile-responsive UI
- [x] Stellar testnet integration
- [x] Soroban smart contracts (Rust)
- [x] Auto-funded testnet accounts

### 🚧 Future Enhancements

- [ ] Account abstraction integration
- [ ] QR code payments
- [ ] Transaction history from Horizon API
- [ ] Contact management
- [ ] Telegram mini-app integration
- [ ] Push notifications
- [ ] Multi-asset support (other Stellar tokens)
- [ ] Stellar mainnet deployment
- [ ] Integration with Stellar anchors for real USD
- [ ] Cross-border remittance features

## 🎨 UI Preview

### Landing Page
- Clean, modern design
- Simple email/phone login
- Feature highlights

### Dashboard
- Wallet balance card
- Send money form
## 🔐 Security

- Smart contracts written in Rust with Soroban SDK (memory-safe)
- Explicit authorization checks on all functions (`require_auth()`)
- Admin-only functions for minting and initialization
- Input validation on frontend and backend
- Secure JWT authentication for user sessions
- Time-locked savings with ledger-based unlocking
- No reentrancy vulnerabilities (Rust ownership model)
- Contract addresses validated before invocationeppelin libraries
- ReentrancyGuard on all state-changing functions
- Ownable pattern for admin functions
## 🧪 Testing

### Rust Contract Tests

```bash
# Test token contract
cd soroban_contracts/sente_token
cargo test

# Test vault contract
cd soroban_contracts/sente_vault
cargo test

# Test with output
cargo test -- --nocapture
```

### Manual Testing Flow

1. **User Registration**
   - Test with email: `test@example.com`
   - Test with phone: `+256700000000`

## 📦 Deployment

### Prerequisites for Deployment

1. **Install Rust & Soroban CLI**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
cargo install --locked soroban-cli
```

2. **Generate Stellar Keypair**
```bash
soroban keys generate deployer --network testnet
soroban keys address deployer  # Get your public key
```

3. **Fund Account (Testnet)**
```bash
curl "https://friendbot.stellar.org/?addr=$(soroban keys address deployer)"
```

### Smart Contracts to Stellar

```bash
# Build contracts
npm run build:soroban

# Deploy to testnet
STELLAR_NETWORK=testnet npm run deploy:stellar

# Deploy to mainnet (when ready)
STELLAR_NETWORK=mainnet npm run deploy:stellar
```

After deployment, contract addresses are saved to `frontend/config/contracts.json`.

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel --prod
```

Set environment variables in Vercel:
- `NEXT_PUBLIC_API_URL`: Your backend API URL

### Backend (Heroku/Railway)

```bash
cd backend
# Set environment variables:
# - DB_CONNECTION_STRING
# - JWT_SECRET
# - PORT
# Deploy using your platform's CLI
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Built with ❤️ by the SenteChain Team

## 🙏 Acknowledgments

- **Documentation**: This README + `STELLAR_SETUP.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **Migration Guide**: `MIGRATION_GUIDE.md`
- **Issues**: [GitHub Issues](https://github.com/ofwonogodwin/SenteChain-MiniApp/issues)
- **Stellar Discord**: https://discord.gg/stellar

## 🛠️ Troubleshooting

### Build Issues
```bash
# Clean and rebuild
rm -rf soroban_build/
npm run build:soroban
```

### Deployment Issues
```bash
# Check account balance
curl "https://horizon-testnet.stellar.org/accounts/$(soroban keys address deployer)"

# Refund account
curl "https://friendbot.stellar.org/?addr=$(soroban keys address deployer)"
```

### Frontend Issues
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Demo Guide

### Quick Demo Script

1. **Show Landing Page** (30 seconds)
   - Explain walletless onboarding for African users
   - Register with email or phone

2. **Connect Freighter Wallet** (30 seconds)
   - Show Stellar Testnet connection
   - Display auto-generated wallet
   - Account automatically funded via Friendbot

3. **Get Test Tokens** (1 minute)
   - Click "Claim 100 sUSDT" faucet button
   - Show transaction confirmation in Freighter
   - Display updated balance (5-10 seconds)

4. **Transfer Money** (1 minute)
   - Enter recipient Stellar address (G...)
   - Send tokens instantly
   - Show confirmation on Stellar Expert

5. **Savings Feature** (1 minute)
   - Lock tokens in savings vault
   - Choose lock duration (1-365 days)
   - Show unlocked balance vs locked balance

## 🔗 Useful Links

- **Stellar Documentation**: https://developers.stellar.org/
- **Soroban Docs**: https://soroban.stellar.org/docs
- **Stellar Expert**: https://stellar.expert/explorer/testnet
- **Stellar Laboratory**: https://laboratory.stellar.org/
- **Freighter Wallet**: https://freighter.app/
- **Rust Book**: https://doc.rust-lang.org/book/

## 📊 Performance Metrics

| Metric | Stellar | Base (Previous) |
|--------|---------|-----------------|
| Transaction Time | ~5 seconds | ~2 seconds |
| Transaction Finality | ~5 seconds | ~12 seconds |
| Average Fee | ~$0.0001 | ~$0.01-0.10 |
| Smart Contract Language | Rust | Solidity |
| Wallet | Freighter | MetaMask |

## 🌍 Why Stellar for Africa?

- **Low Fees**: ~$0.0001 per transaction vs $0.01-0.10 on other chains
- **Fast Finality**: 5 seconds vs 12+ seconds
- **Built for Payments**: Stellar designed for cross-border transfers
- **Anchor Network**: Easy fiat on/off ramps in Africa
- **Mobile First**: Optimized for mobile devices
- **Growing Adoption**: Multiple African fintech companies use Stellar

---

**Built with ❤️ for financial inclusion in Africa** 🌍
