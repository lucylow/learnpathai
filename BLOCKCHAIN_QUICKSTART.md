# 🚀 Blockchain Quick Start (5 Minutes)

Get blockchain certificates up and running in 5 minutes for your hackathon demo.

## Prerequisites

- Node.js installed
- MetaMask wallet extension
- 5 minutes ⏱️

## Steps

### 1. Get API Keys (2 min)

```bash
# Get Alchemy key (for blockchain RPC)
# 1. Visit: https://www.alchemy.com
# 2. Sign up / login
# 3. Create app: "LearnPath" on Polygon Mumbai
# 4. Copy HTTP API key

# Get Web3.Storage token (for IPFS)
# 1. Visit: https://web3.storage
# 2. Sign up with GitHub
# 3. Create API token
# 4. Copy token
```

### 2. Install & Configure (1 min)

```bash
cd /Users/llow/Desktop/learnpathai

# Install blockchain dependencies
cd blockchain
npm install

# Configure environment
cp .env.example .env
nano .env
```

Paste in `.env`:
```env
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_test_wallet_private_key
WEB3_STORAGE_TOKEN=your_web3_storage_token
```

### 3. Get Test Funds (30 sec)

```bash
# Get your wallet address
node -e "console.log(new (require('ethers')).Wallet(process.env.PRIVATE_KEY).address)"

# Visit faucet and paste address:
# https://faucet.polygon.technology
# Click "Submit" and wait 30 seconds
```

### 4. Deploy Contracts (1 min)

```bash
# Compile
npm run compile

# Deploy to Mumbai testnet
npm run deploy:mumbai

# SAVE THE CONTRACT ADDRESSES shown in output!
```

### 5. Update Backend (.env)

```bash
cd ../backend
nano .env
```

Add:
```env
BADGE_CONTRACT_ADDRESS=0x...   # From step 4
TOKEN_CONTRACT_ADDRESS=0x...    # From step 4
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key
WEB3_STORAGE_TOKEN=your_token
```

### 6. Start & Test (30 sec)

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd ..
npm run dev

# Open: http://localhost:5173/blockchain
# Click "Connect Wallet"
# Approve in MetaMask
# You're ready! 🎉
```

## Quick Demo Script

For judges/demo:

```bash
# 1. Show blockchain page
open http://localhost:5173/blockchain

# 2. Connect wallet (MetaMask popup)
# Click "Connect Wallet" button

# 3. Issue a test badge via API
curl -X POST http://localhost:3000/api/blockchain/badges/issue \
  -H "Content-Type: application/json" \
  -d '{
    "recipientAddress": "YOUR_WALLET_ADDRESS",
    "achievementName": "Python Expert",
    "achievementDescription": "Mastered Python programming",
    "category": "python",
    "level": "expert",
    "rewardTokens": 100
  }'

# 4. Refresh page - badge appears!
# 5. Click "Verify" - shows green checkmark
# 6. Click "Share" - share on Twitter/LinkedIn
# 7. View on Mumbai PolygonScan explorer
```

## Troubleshooting

**"Insufficient funds"** → Get more test MATIC from faucet

**"Wrong network"** → Switch MetaMask to Mumbai testnet

**"Contract not deployed"** → Check you ran `npm run deploy:mumbai`

**"ABIs not found"** → Run deployment again, ABIs auto-copy to backend

## Next Steps

- Full setup guide: See `BLOCKCHAIN_SETUP.md`
- Customize badge designs in `backend/services/IPFSService.js`
- Add auto-badge issuance on course completion
- Deploy to mainnet for production

---

**Ready to wow the judges!** 🏆

Your platform now has blockchain-verified certificates that students can share and verify anywhere.

