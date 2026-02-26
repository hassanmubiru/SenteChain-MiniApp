# 💰 SenteChain MiniApp

> A Web3 mini-application built on **Celo** that allows Ugandans to send, receive, and save stablecoins (USDT) easily — no crypto knowledge required.

![Celo](https://img.shields.io/badge/Celo-Alfajores-FCFF52?style=for-the-badge&logo=celo)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🎯 Overview

SenteChain is a fully functional decentralized application (dApp) that simplifies crypto transactions for everyday users. Built on Celo Alfajores Testnet using Solidity smart contracts, it provides:

- **Walletless Login**: Users register with email or phone number
- **Auto-Generated Wallets**: Smart accounts created automatically
- **Instant Transfers**: Send/receive USDT between users with low fees
- **Savings Vault**: Lock tokens for savings with time-based unlocks
- **Mobile-First UI**: Clean, intuitive interface built with TailwindCSS

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15 + React 19 + TailwindCSS
- **Smart Contracts**: Solidity 0.8.20
- **Blockchain**: Celo Alfajores Testnet
- **Web3 Library**: ethers.js v6
- **Wallet**: MetaMask
- **Backend**: Node.js/Express
- **Development**: Hardhat

### Project Structure

\`\`\`
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
│   │   ├── contract.js         # Smart contract interactions
│   │   ├── networkConfig.js    # Celo network config
│   │   └── connectWallet.js    # MetaMask connection
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
├── smart_contracts/             # Solidity contracts
│   ├── SenteToken.sol          # Token contract (sUSDT)
│   ├── SenteVault.sol          # Vault management
│   └── deploy.js              # Deployment script
└── package.json                # Root dependencies
\`\`\`

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- **MetaMask Wallet** ([Install here](https://metamask.io))
- Git

### Installation

1. **Clone the repository**

\`\`\`bash
git clone https://github.com/ofwonogodwin/SenteChain-MiniApp.git
cd SenteChain-MiniApp
\`\`\`

2. **Install all dependencies**

\`\`\`bash
npm run install:all
\`\`\`

3. **Set up environment variables**

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` and configure for Celo:
\`\`\`env
PRIVATE_KEY=your_private_key_here
CELO_ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org
\`\`\`

### 🔧 Development Setup

#### 1. Deploy Smart Contracts to Celo Alfajores

\`\`\`bash
npx hardhat run smart_contracts/deploy.js --network celoAlfajores
\`\`\`

This will:
- Deploy \`SenteToken\` contract
- Deploy \`SenteVault\` contract
- Initialize both contracts
- Save contract addresses to \`frontend/config/contracts.json\`

#### 2. Start the Backend

\`\`\`bash
cd backend
npm run dev
\`\`\`

Backend will run on \`http://localhost:5000\`

#### 3. Start the Frontend

In a new terminal:

\`\`\`bash
cd frontend
npm run dev
\`\`\`

Frontend will run on \`http://localhost:3000\`

## 📝 Smart Contracts

### SenteToken (ERC20 Token Contract)

Custom token contract with 6 decimals (USDT standard).

**Key Functions:**
- \`transfer(to, amount)\` - Transfer tokens
- \`approve(spender, amount)\` - Approve spending
- \`claimFaucet()\` - Get 100 free testnet tokens (once per day)
- \`balanceOf(account)\` - Check token balance
- \`canClaimFaucet(user)\` - Check if eligible for faucet

### SenteVault (Vault Contract)

Manages user deposits, transfers, and time-locked savings.

**Key Functions:**
- \`deposit(amount)\` - Deposit tokens to vault
- \`withdraw(amount)\` - Withdraw tokens from vault
- \`transfer(to, amount)\` - Transfer between users in vault
- \`saveToVault(amount, lockDurationDays)\` - Lock tokens for savings
- \`withdrawFromVault(amount)\` - Unlock savings (after lock period)
- \`balanceOf(user)\` - Get available balance
- \`savingsBalanceOf(user)\` - Get locked savings balance

## 🌐 Celo Network Configuration

### Alfajores Testnet (Development)
- **Chain ID**: 44787 (0xAEF3)
- **RPC URL**: https://alfajores-forno.celo-testnet.org
- **Currency**: CELO (testnet)
- **Explorer**: https://alfajores.celoscan.io
- **Faucet**: https://faucet.celo.org/alfajores

### Mainnet (Production)
- **Chain ID**: 42220 (0xA4EC)
- **RPC URL**: https://forno.celo.org
- **Currency**: CELO
- **Explorer**: https://celoscan.io

## 📱 Features

### ✅ Implemented

- [x] Email/phone registration
- [x] Auto-generated wallets
- [x] MetaMask wallet integration
- [x] Token faucet (100 sUSDT/day on testnet)
- [x] Vault deposits/withdrawals
- [x] Instant peer-to-peer transfers
- [x] Savings vault with time locks (1-365 days)
- [x] Real-time balance updates
- [x] Transaction notifications
- [x] Mobile-responsive UI
- [x] Celo Alfajores testnet integration

## 🔐 Security

- Smart contracts written in Solidity with OpenZeppelin libraries
- ReentrancyGuard on all state-changing functions
- Ownable pattern for admin functions
- Input validation on frontend and backend
- Secure JWT authentication for user sessions
- Time-locked savings with block-based unlocking

## 📦 Deployment

### Smart Contracts to Celo

\`\`\`bash
# Deploy to Alfajores testnet
npx hardhat run smart_contracts/deploy.js --network celoAlfajores

# Deploy to mainnet (when ready)
npx hardhat run smart_contracts/deploy.js --network celoMainnet
\`\`\`

## 🔗 Useful Links

- **Celo Documentation**: https://docs.celo.org/
- **Celo Faucet**: https://faucet.celo.org/alfajores
- **CeloScan**: https://celoscan.io/
- **MetaMask**: https://metamask.io/
- **Hardhat Docs**: https://hardhat.org/docs

## 🌍 Why Celo for Africa?

- **Mobile-First**: Celo is designed for mobile users
- **Low Fees**: Sub-cent transaction fees
- **Fast Finality**: ~5 seconds per block
- **Stablecoins**: Native cUSD and cEUR support
- **Phone Number Mapping**: Send crypto using phone numbers
- **African Focus**: Strong presence in East Africa
- **Carbon Negative**: Environmentally sustainable

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for financial inclusion in Africa** 🌍
