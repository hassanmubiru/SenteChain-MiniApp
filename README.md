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
npx hardhat console --network baseSepolia
```

## 🌐 Base Sepolia Configuration

- **Network Name**: Base Sepolia
- **RPC URL**: https://sepolia.base.org
- **Chain ID**: 84532 (0x14a34)
- **Currency Symbol**: ETH
- **Block Explorer**: https://sepolia.basescan.org

## 📱 Features

### ✅ Implemented

- [x] Email/phone registration
- [x] Auto-generated wallets
- [x] MetaMask integration
- [x] Token faucet (testnet)
- [x] Vault deposits/withdrawals
- [x] Instant peer-to-peer transfers
- [x] Savings vault with time locks
- [x] Real-time balance updates
- [x] Transaction notifications
- [x] Mobile-responsive UI
- [x] Base Sepolia integration

### 🚧 Future Enhancements

- [ ] Account abstraction (Privy/Web3Auth)
- [ ] QR code payments
- [ ] Transaction history
- [ ] Contact management
- [ ] Telegram mini-app integration
- [ ] Push notifications
- [ ] Multi-currency support
- [ ] Mainnet deployment

## 🎨 UI Preview

### Landing Page
- Clean, modern design
- Simple email/phone login
- Feature highlights

### Dashboard
- Wallet balance card
- Send money form
- Savings vault interface
- Quick action buttons
- Transaction status

## 🔐 Security

- Smart contracts use OpenZeppelin libraries
- ReentrancyGuard on all state-changing functions
- Ownable pattern for admin functions
- Input validation on frontend and backend
- Secure JWT authentication

## 🧪 Testing

### Manual Testing Flow

1. **User Registration**
   - Test with email: `test@example.com`
   - Test with phone: `+256700000000`

2. **Get Testnet Tokens**
   - Use faucet to get 100 sUSDT
   - Check wallet balance updates

3. **Transfer Flow**
   - Create second account
   - Transfer between accounts
   - Verify balances

4. **Savings Flow**
   - Lock 50 sUSDT for 7 days
   - Try to withdraw (should fail)
   - Check unlock date
   - Wait or modify timestamp in testing

## 📦 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Heroku/Railway)

```bash
cd backend
# Set environment variables
# Deploy using your platform's CLI
```

### Smart Contracts

Already deployed to Base Sepolia! Check `frontend/config/contracts.json` for addresses.

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

- [Base](https://base.org) - For the amazing L2 infrastructure
- [OpenZeppelin](https://openzeppelin.com) - For secure smart contract libraries
- [Hardhat](https://hardhat.org) - For the development environment
- [Next.js](https://nextjs.org) - For the React framework

## 📞 Support

- **Documentation**: This README
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discord**: Join our community server

## 🎯 Hackathon Demo

### Quick Demo Script

1. **Show Landing Page** (30 seconds)
   - Explain walletless onboarding
   - Register with email

2. **Connect MetaMask** (30 seconds)
   - Show Base Sepolia connection
   - Display auto-generated wallet

3. **Get Test Tokens** (1 minute)
   - Use faucet feature
   - Show transaction on explorer

4. **Transfer Money** (1 minute)
   - Send to another address
   - Show instant confirmation

5. **Lock Savings** (1 minute)
   - Demonstrate savings vault
   - Show unlock mechanism

### Key Talking Points

- ✨ **No Crypto Knowledge Required**: Users just need email/phone
- ⚡ **Instant Transfers**: Zero-fee transfers within SenteChain
- 🔒 **Savings Feature**: Encourage financial discipline
- 🌍 **Built on Base**: Leveraging Coinbase's L2 for scalability
- 📱 **Mobile-First**: Designed for African mobile users

---

**Made with 💚 for Ugandans by Ugandans**

🚀 Ready to revolutionize remittances in Africa!
