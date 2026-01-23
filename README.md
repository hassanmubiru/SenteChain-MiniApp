# 💰 SenteChain MiniApp

> A Web3 mini-application to be built on **Stellar** that allows Ugandans to send, receive, and save stablecoins (USDT) easily — no crypto knowledge required.

![Base](https://img.shields.io/badge/Base-Sepolia-0052FF?style=for-the-badge&logo=coinbase)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🎯 Overview

SenteChain is a fully functional decentralized application (dApp) that simplifies crypto transactions for everyday users. Built on Base Sepolia testnet, it provides:

- **Walletless Login**: Users register with email or phone number
- **Auto-Generated Wallets**: Smart accounts created automatically
- **Instant Transfers**: Send/receive USDT between users with zero fees
- **Savings Vault**: Lock tokens for savings with time-based unlocks
- **Mobile-First UI**: Clean, intuitive interface built with TailwindCSS

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15 + React 19 + TailwindCSS
- **Smart Contracts**: Solidity 0.8.20
- **Blockchain**: Base Sepolia (Testnet)
- **Web3 Library**: ethers.js v6
- **Backend**: Node.js/Express
- **Development**: Hardhat

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
│   │   ├── contract.js         # Smart contract interactions
│   │   └── connectWallet.js    # MetaMask connection
│   ├── config/
│   │   ├── contracts.json      # Deployed contract addresses
│   │   ├── SenteTokenABI.json  # Token contract ABI
│   │   └── SenteVaultABI.json  # Vault contract ABI
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
│   ├── SenteToken.sol          # ERC20 token (sUSDT)
│   ├── SenteVault.sol          # Vault management
│   └── deploy.js               # Deployment script
├── hardhat.config.js           # Hardhat configuration
└── package.json                # Root dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**

```bash
cd /home/godwin-ofwono/Desktop/EthNile/SenteChainMiniApp
```

2. **Install root dependencies**

```bash
npm install
```

3. **Install frontend dependencies**

```bash
cd frontend
npm install
cd ..
```

4. **Install backend dependencies**

```bash
cd backend
npm install
cd ..
```

5. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and add:
- `PRIVATE_KEY`: Your wallet private key (for deployment)
- `BASE_SEPOLIA_RPC`: https://sepolia.base.org
- Other variables as needed

### 🔧 Development Setup

#### 1. Compile Smart Contracts

```bash
npm run compile
```

#### 2. Deploy to Base Sepolia

Make sure you have Base Sepolia ETH in your wallet (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)).

```bash
npm run deploy
```

This will:
- Deploy `SenteToken` contract
- Deploy `SenteVault` contract
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

### SenteToken (ERC20)

Mock USDT token with 6 decimals.

**Key Functions:**
- `faucet(uint256 amount)` - Get free testnet tokens (max 1000 sUSDT)
- `approve(address spender, uint256 amount)` - Approve vault to spend tokens
- `balanceOf(address account)` - Check token balance

### SenteVault

Manages user deposits, transfers, and savings.

**Key Functions:**
- `deposit(uint256 amount)` - Deposit tokens to vault
- `withdraw(uint256 amount)` - Withdraw tokens from vault
- `transfer(address to, uint256 amount)` - Transfer between users
- `saveToVault(uint256 amount, uint256 lockDuration)` - Lock tokens for savings
- `withdrawFromVault(uint256 amount)` - Unlock savings (after lock period)
- `getBalance(address user)` - Get available balance
- `getSavingsBalance(address user)` - Get locked savings balance

## 🎮 Usage Guide

### For Users

1. **Register/Login**
   - Go to `http://localhost:3000`
   - Enter your email or phone number
   - Your wallet is automatically created!

2. **Connect MetaMask**
   - Click "Connect Wallet" on the dashboard
   - Approve the connection in MetaMask
   - Switch to Base Sepolia network (auto-prompt)

3. **Get Test Tokens**
   - Click "Claim 100 sUSDT" button
   - Confirm transaction in MetaMask
   - Wait for confirmation

4. **Deposit to Vault**
   - Click "Deposit to Vault"
   - Enter amount
   - Approve tokens → Deposit

5. **Send Money**
   - Enter recipient address
   - Enter amount
   - Click "Send Now"

6. **Save Money**
   - Go to "Savings Vault" tab
   - Select "Lock Savings"
   - Choose amount and lock period
   - Confirm transaction

### For Developers

#### Testing Contracts Locally

```bash
npx hardhat test
```

#### Deploying to Other Networks

Edit `hardhat.config.js` and add your network configuration, then:

```bash
npx hardhat run smart_contracts/deploy.js --network yourNetwork
```

#### Interacting with Contracts

Use the Hardhat console:

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
