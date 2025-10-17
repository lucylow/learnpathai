# 🔗 LearnPath AI Blockchain Contracts

Smart contracts for verifiable learning certificates and tokenized rewards.

## 📁 Structure

```
blockchain/
├── contracts/
│   ├── LearnPathBadge.sol    # ERC-721 NFT certificates
│   └── LearnPathToken.sol     # ERC-20 reward tokens
├── scripts/
│   ├── deploy.js              # Deploy to network
│   ├── test-mint.js           # Test minting flow
│   └── check-balance.js       # Check wallet balance
├── test/                      # Contract tests (TODO)
├── deployments/               # Deployment records
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Dependencies
└── .env.example               # Configuration template

```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

Required variables:
```env
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key_without_0x
WEB3_STORAGE_TOKEN=your_token
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Deploy

```bash
# Local Hardhat network
npm run node              # Terminal 1
npm run deploy:local      # Terminal 2

# Mumbai testnet
npm run deploy:mumbai

# Polygon mainnet
npm run deploy:polygon
```

### 5. Test

```bash
npm run test-mint
```

## 📜 Smart Contracts

### LearnPathBadge (ERC-721)

Achievement NFTs with:
- On-chain proof anchoring
- Revocation system
- Merkle verification
- OpenSea compatible
- Role-based minting

**Key Functions:**
- `mintBadge(address, tokenURI, proofHash)` - Mint new badge
- `verifyProof(tokenId, hash)` - Verify authenticity
- `revoke(tokenId)` - Revoke badge
- `getBadgesByOwner(address)` - Query badges

### LearnPathToken (ERC-20)

Reward tokens with:
- Achievement-based minting
- Optional transfer restrictions (soulbound)
- Batch operations
- 10M max supply

**Key Functions:**
- `rewardAchievement(address, points, reason)` - Reward tokens
- `mint(address, amount, reason)` - Admin mint
- `setTransferRestriction(bool)` - Enable/disable transfers

## 🔐 Security

- ✅ OpenZeppelin contracts
- ✅ Role-based access control
- ✅ Pausable for emergencies
- ✅ Gas optimized (200 runs)
- ✅ No PII on-chain

**Never commit `.env` file!**

## 📊 Networks

| Network | Chain ID | RPC | Faucet |
|---------|----------|-----|--------|
| Mumbai Testnet | 80001 | Alchemy/Infura | [Link](https://faucet.polygon.technology) |
| Polygon Mainnet | 137 | Alchemy/Infura | N/A |
| Hardhat Local | 1337 | localhost:8545 | Built-in |

## 💰 Gas Estimates

**Mumbai Testnet** (free):
- Badge mint: ~250k gas
- Token reward: ~100k gas

**Polygon Mainnet** (~$0.01-0.05 per tx):
- Badge mint: ~250k gas
- Token reward: ~100k gas

## 📚 Documentation

- **Full Setup:** See `../BLOCKCHAIN_SETUP.md`
- **Quick Start:** See `../BLOCKCHAIN_QUICKSTART.md`
- **Implementation Summary:** See `../BLOCKCHAIN_IMPLEMENTATION_SUMMARY.md`

## 🛠️ NPM Scripts

```bash
npm run compile         # Compile contracts
npm run test           # Run tests
npm run deploy:local   # Deploy to local Hardhat
npm run deploy:mumbai  # Deploy to Mumbai testnet
npm run deploy:polygon # Deploy to Polygon mainnet
npm run node           # Start local Hardhat node
npm run clean          # Clean artifacts
```

## 🔍 Verify on PolygonScan

```bash
npx hardhat verify --network mumbai 0xCONTRACT_ADDRESS "Constructor" "Args"
```

## 📦 Deployment Output

Deployments are saved to `deployments/{network}.json`:

```json
{
  "network": "mumbai",
  "chainId": 80001,
  "contracts": {
    "LearnPathBadge": {
      "address": "0x...",
      "abi": "LearnPathBadge.json"
    },
    "LearnPathToken": {
      "address": "0x...",
      "abi": "LearnPathToken.json"
    }
  },
  "deployer": "0x...",
  "timestamp": "2025-10-17T..."
}
```

ABIs are automatically copied to `../backend/contracts/` for integration.

## 🤝 Integration

After deployment, update backend `.env`:

```env
BADGE_CONTRACT_ADDRESS=0x_badge_contract
TOKEN_CONTRACT_ADDRESS=0x_token_contract
RPC_URL=your_rpc_url
PRIVATE_KEY=backend_service_key
```

Restart backend to use blockchain features.

## 🐛 Troubleshooting

**"Insufficient funds"**
```bash
npm run check-balance
# Get test MATIC from faucet
```

**"Network not supported"**
- Check RPC_URL in `.env`
- Verify network in hardhat.config.js

**"Contract not deployed"**
- Run `npm run deploy:mumbai` first
- Check deployments/ folder exists

**"ABIs not found in backend"**
- ABIs auto-copy during deployment
- Or manually: `cp artifacts/contracts/*/**.json ../backend/contracts/`

## 📞 Support

Issues? Check:
1. This README
2. `../BLOCKCHAIN_SETUP.md` (comprehensive guide)
3. `../BLOCKCHAIN_QUICKSTART.md` (fast setup)
4. Contract events on PolygonScan

## 🎉 Success!

You're ready to issue blockchain-verified certificates!

Visit `http://localhost:5173/blockchain` to see your achievements.

