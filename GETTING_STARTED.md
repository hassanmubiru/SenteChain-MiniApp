# 🚀 Getting Started with SenteChain on Stellar

Welcome! This guide will get you up and running with SenteChain in 15 minutes.

## ⏱️ Quick Setup (15 Minutes)

### Step 1: Install Prerequisites (5 minutes)

#### Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

#### Add WebAssembly Target
```bash
rustup target add wasm32-unknown-unknown
```

#### Install Soroban CLI
```bash
cargo install --locked soroban-cli
```

#### Verify Installations
```bash
rustc --version    # Should show: rustc 1.x.x
cargo --version    # Should show: cargo 1.x.x
soroban --version  # Should show: soroban x.x.x
```

### Step 2: Install Project Dependencies (3 minutes)

```bash
cd /home/godwin-ofwono/Desktop/BlockChain/SenteChain-MiniApp
npm run install:all
```

### Step 3: Generate Stellar Keypair (1 minute)

```bash
# Generate keypair for testnet
soroban keys generate deployer --network testnet

# Get your public key (starts with G...)
soroban keys address deployer

# Save this! You'll need it
```

### Step 4: Configure Environment (1 minute)

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your secret key
nano .env
```

Add this to `.env`:
```env
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=S...  # Your secret key from soroban keys
```

### Step 5: Build Smart Contracts (2 minutes)

```bash
npm run build:soroban
```

This compiles Rust → WASM and optimizes the contracts.

### Step 6: Deploy to Stellar Testnet (2 minutes)

```bash
npm run deploy:stellar
```

This will:
- Auto-fund your testnet account via Friendbot
- Deploy SenteToken contract
- Deploy SenteVault contract
- Initialize both contracts
- Save addresses to `frontend/config/contracts.json`

### Step 7: Start the Application (1 minute)

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Or run both together:
```bash
npm run dev
```

## 🎉 You're Ready!

1. **Install Freighter Wallet**: https://freighter.app
2. **Open App**: http://localhost:3000
3. **Connect Wallet**: Click "Connect Wallet"
4. **Start Using**: Claim tokens, transfer, save!

---

## 📋 Verification Checklist

Make sure everything is working:

- [ ] Rust installed (`rustc --version`)
- [ ] Soroban CLI installed (`soroban --version`)
- [ ] Dependencies installed (no errors)
- [ ] Keypair generated (starts with S...)
- [ ] `.env` file configured
- [ ] Contracts built successfully (see `soroban_build/`)
- [ ] Contracts deployed (check `frontend/config/contracts.json`)
- [ ] Backend running (http://localhost:5000)
- [ ] Frontend running (http://localhost:3000)
- [ ] Freighter wallet installed

---

## 🐛 Common Issues

### "Rust not found"
```bash
# Source cargo environment
source $HOME/.cargo/env

# Or add to shell profile
echo 'source $HOME/.cargo/env' >> ~/.bashrc
```

### "Soroban not found"
```bash
# Ensure cargo bin is in PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Reinstall soroban
cargo install --locked soroban-cli --force
```

### "Account not found" during deployment
```bash
# Fund your account manually
curl "https://friendbot.stellar.org/?addr=$(soroban keys address deployer)"
```

### "Build failed" errors
```bash
# Clean and rebuild
rm -rf soroban_build/
rm -rf soroban_contracts/target/
npm run build:soroban
```

### Frontend won't connect
```bash
# Make sure Freighter is on testnet
# Check contracts.json exists
cat frontend/config/contracts.json

# Reinstall frontend deps
cd frontend
rm -rf node_modules
npm install
```

---

## 🎯 Next Steps

Once everything is running:

1. **Connect Freighter Wallet**
   - Click "Connect Wallet" button
   - Approve connection
   - Your account is auto-funded!

2. **Claim Test Tokens**
   - Click "Claim 100 sUSDT"
   - Confirm in Freighter
   - Wait 5-10 seconds

3. **Try Transfers**
   - Get a second Stellar address
   - Send tokens between accounts
   - Check balances update

4. **Test Savings Vault**
   - Lock some tokens
   - Set unlock period
   - Try to withdraw (will fail - locked!)
   - Wait for unlock period

---

## 📚 Learn More

- **Full Documentation**: See `README.md`
- **Setup Details**: See `STELLAR_SETUP.md`
- **Migration Info**: See `MIGRATION_GUIDE.md`
- **Quick Commands**: See `QUICK_REFERENCE.md`

---

## 💡 Pro Tips

1. **Use Stellar Laboratory** (https://laboratory.stellar.org/) to inspect your account
2. **Check Stellar Expert** (https://stellar.expert/explorer/testnet) to view transactions
3. **Keep your secret key safe** - never commit to git
4. **Test on testnet first** before going to mainnet
5. **Join Stellar Discord** (https://discord.gg/stellar) for help

---

## 🎊 Success!

You now have a fully functional Stellar dApp running locally!

**What you've built:**
- ✅ Rust smart contracts deployed to Stellar
- ✅ Next.js frontend with Stellar SDK
- ✅ Express.js backend for user management
- ✅ Freighter wallet integration
- ✅ Token transfers and savings features

**Ready to build more?** Check out the full docs in `README.md`

---

**Need help?** Open an issue or join the Stellar Discord!

🌟 **Star this repo if you found it useful!** 🌟
