# ShadowBid

ShadowBid is a sealed-bid auction protocol where bids stay encrypted forever — even from the contract itself. Built on Fhenix Fully Homomorphic Encryption (FHE) to eliminate MEV, front-running, and bid sniping in on-chain auctions.

## The Problem

On-chain auctions are fundamentally broken. Every bid is visible on the blockchain, enabling:
- **MEV extraction**: Bots monitor the mempool and front-run legitimate bids
- **Bid sniping**: Last-minute bids steal auctions from honest participants
- **Price manipulation**: Competitors see your strategy and adjust accordingly

Over $500M is extracted annually from DeFi through these attacks. Traditional solutions require trusted third parties or off-chain computation, which reintroduces centralization risks.

## The Solution

ShadowBid uses Fhenix's Fully Homomorphic Encryption to keep bids encrypted on-chain while still allowing the contract to compute the winner. The contract can compare encrypted values without ever decrypting them — no trusted party needed.

### How FHE Works (For Judges)

FHE allows computations on encrypted data without decryption. You can add, multiply, and compare encrypted numbers, and the result remains encrypted. Only the holder of the decryption key can reveal the final result.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Solidity 0.8.28, Fhenix CoFHE (`@fhenixprotocol/cofhe-contracts`) |
| Dev Tooling | Hardhat, `@cofhe/hardhat-plugin` |
| Frontend | React 19, Vite, TypeScript |
| Wallet Connection | wagmi v3, RainbowKit v2 |
| FHE Client SDK | `@cofhe/sdk` + `@cofhe/react` |
| Target Chain | Arbitrum Sepolia (chainId: 421614) |
| UI Library | TailwindCSS, Framer Motion, Sonner |

## Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/nohypelabas/ShadowBid.git
cd ShadowBid

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up environment variables
cd ../contracts
cp .env.example .env
# Edit .env and add your private key

cd ../frontend
cp .env.example .env
# Edit .env and add your WalletConnect project ID
```

### Environment Variables

**Contracts** — create `.env` in the `/contracts` directory:

```bash
PRIVATE_KEY=your_private_key_here
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
ARBISCAN_API_KEY=optional_for_verification
```

**Frontend** — create `.env` in the `/frontend` directory:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Get a free project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/).

### Deploy Contracts

```bash
cd contracts

# Compile contracts
npm run compile

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy.ts --network arbitrumSepolia
```

The deployed contract address will be printed. Update the frontend's contract address in `frontend/src/constants/contracts.ts` if different.

### Run Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Testnet Deployment

**Contract Address**: `0xF801Bb64c6f396e431ad0C3b8D8770BC028fF0D1`
**Network**: Arbitrum Sepolia
**Explorer**: [Arbiscan](https://sepolia.arbiscan.io/address/0xF801Bb64c6f396e431ad0C3b8D8770BC028fF0D1)

The contract is already deployed and ready to use. No additional deployment needed for testing.

## How to Run Tests

```bash
cd contracts
npm test
```

Tests use the CoFHE mock coprocessor automatically — no external dependencies required.

## Demo Instructions

1. Connect your wallet (Arbitrum Sepolia network)
2. Navigate to the **Demo** route in the app
3. Click **"Load Demo Auctions"** to create 3 sample auctions:
   - Launch Auction (48 hours, 0.1 ETH min)
   - NFT Bundle (2 hours, 0.05 ETH min)
   - Early Bird (24 hours, 0.01 ETH min)
4. Place encrypted bids on active auctions
5. Wait for auction to end, then finalize as seller
6. Winner is revealed using FHE decryption

## Architecture

- `/contracts` — Hardhat project with CoFHE integration
- `/frontend` — React + Vite app with wagmi and RainbowKit
- `/frontend/src/components` — Reusable UI components (AuctionCard, CountdownTimer, ErrorBoundary)
- `/frontend/src/pages` — Page components (Home, CreateAuction, AuctionDetail, Demo)
- `/frontend/src/constants` — Contract addresses and ABIs

## Contract Functions

- `createAuction(string title, uint256 duration, InEuint64 minimumBidEncrypted)` — Create a new auction
- `placeBid(uint256 auctionId, InEuint64 bidAmountEncrypted)` — Submit an encrypted bid
- `finalize(uint256 auctionId)` — End bidding and make winner data publicly decryptable
- `revealWinner(uint256 auctionId, euint64 bidCtHash, uint64 bidDecrypted, bytes bidSignature, eaddress winnerCtHash, address winnerDecrypted, bytes winnerSignature)` — Verify Threshold Network signatures and publish plaintext winner + bid on-chain
- `getBidderCount(uint256 auctionId)` — Get total number of bidders
- `getBidder(uint256 auctionId, uint256 index)` — Get bidder address by index
- `getHighestBidCtHash(uint256 auctionId)` — Get ciphertext hash of highest bid
- `getHighestBidderCtHash(uint256 auctionId)` — Get ciphertext hash of highest bidder

## Security Notes

- All bids are encrypted using FHE before submission
- The contract can compare encrypted values without decryption
- Only the auction winner is revealed; losing bids stay encrypted
- Decryption requires a permit from the Fhenix Threshold Network
- No trusted third parties or off-chain computation required

## Built For

**Privacy-by-Design dApp Buildathon** — Build the Encrypted Fhenix Ecosystem.

The window for privacy-native architecture is open. This project is built for founders who want to bake privacy in from day one — not retrofit it later.

## License

MIT
