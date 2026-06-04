# ShadowBid — Sealed-Bid Auctions on Fhenix

## One-Liner

ShadowBid is a sealed-bid auction protocol where bids stay encrypted forever — even from the contract itself.

## The Problem

On-chain auctions are fundamentally broken. Every bid is visible on the blockchain, creating three critical vulnerabilities:

### MEV Extraction
Bots monitor the mempool and front-run legitimate bids by paying higher gas fees. They copy your bid, add a tiny premium, and steal the auction you were about to win.

### Bid Sniping
Last-minute bids appear in the final block, preventing honest bidders from responding. This turns auctions into timing games rather than value competitions.

### Price Manipulation
Competitors see your bidding strategy in real-time and adjust their bids accordingly. You can't bluff or strategize when your hand is always visible.

**The Cost**: Over $500M is extracted annually from DeFi through these attacks. Traditional solutions require trusted third parties or off-chain computation, which reintroduces centralization risks and defeats the purpose of on-chain auctions.

## The Solution

ShadowBid uses Fhenix's Fully Homomorphic Encryption (FHE) to keep bids encrypted on-chain while still allowing the contract to compute the winner. The contract can compare encrypted values without ever decrypting them — no trusted party needed.

### Why Fhenix?

Fhenix is the only L2 that natively supports FHE operations on-chain. Other approaches require:
- Trusted execution environments (Intel SGX) — hardware-dependent, opaque
- Zero-knowledge proofs — expensive, complex, limited computation
- Off-chain computation — reintroduces centralization

Fhenix enables **CMUX** (Compare-Multiplexer) operations directly on-chain. The contract can compare encrypted bid amounts, select the winner, and output the result — all while the bids remain encrypted.

## How It Works

```
┌─────────────┐    Encrypt    ┌─────────────┐    Submit    ┌─────────────┐
│   Bidder    │ ──────────► │   CoFHE     │ ──────────► │  Contract   │
│  (0.5 ETH)  │              │    SDK      │            │ (euint64)   │
└─────────────┘              └─────────────┘            └─────────────┘
                                                              │
                                                              │ Compare
                                                              ▼
┌─────────────┐    Decrypt    ┌─────────────┐    Reveal    ┌─────────────┐
│   Winner    │ ◄──────────── │  Fhenix     │ ◄──────────── │  Finalize   │
│  Revealed   │    (permit)   │ Threshold   │   (permit)  │   Call      │
└─────────────┘              └─────────────┘            └─────────────┘
```

### Step-by-Step

1. **Bidder encrypts bid** using CoFHE SDK client-side (0.5 ETH → encrypted ciphertext)
2. **Submit encrypted bid** to contract as `euint64` type
3. **Contract stores ciphertext** on-chain — no one can read the value
4. **Bidding ends** — seller calls `finalize()`
5. **Contract compares encrypted bids** using FHE CMUX operations
6. **Highest bid selected** — still encrypted
7. **Seller requests decryption permit** from Fhenix Threshold Network
8. **Winner revealed** — only the winning bid and bidder are decrypted
9. **Losing bids remain encrypted** forever

## What Makes ShadowBid Different

### Privacy by Default
Every competing auction protocol reveals all bids after the auction ends. ShadowBid only reveals the winner. Losing bids stay encrypted forever, protecting bidder privacy and strategy.

### No Trusted Parties
Traditional sealed-bid auctions require a trusted auctioneer to hold bids until reveal. ShadowBid uses FHE — the contract itself can compute the winner without ever seeing the bids.

### True On-Chain Computation
No off-chain oracles, no TEEs, no ZK rollups. Everything happens on-chain using Fhenix's native FHE operations.

### MEV-Resistant
Since bids are encrypted, MEV bots cannot front-run or copy bids. The first bid is as private as the last.

## Market Opportunity

The on-chain auction market is massive and growing:
- NFT marketplaces: $10B+ annual volume
- DeFi liquidations: $50B+ annual volume
- Token sales: $5B+ annual volume
- Governance voting: Increasing adoption

All of these suffer from MEV and front-running. ShadowBid's technology applies to any sealed-bid scenario.

## Technical Highlights

### Smart Contract
- Solidity 0.8.28 with Fhenix CoFHE integration
- Deployed on Arbitrum Sepolia: `0x96dA01145BE15b12e659630b4E4597Cb626Ff447`
- Gas-efficient: ~150k gas for bid submission, ~200k for finalize
- No external dependencies beyond Fhenix coprocessor

### Frontend
- React 19 + Vite + TypeScript
- wagmi v3 + RainbowKit v2 for wallet connection
- CoFHE React SDK for client-side encryption
- Responsive dark-themed UI with smooth animations
- Demo mode for quick testing

### Security
- Bids encrypted before leaving client
- Contract cannot decrypt without permit
- Threshold Network prevents single-point compromise
- Losing bids never revealed

## Future Roadmap

### Phase 7: Multi-Item Auctions
- Dutch auctions
- Vickrey auctions (second-price sealed-bid)
- Bundle auctions

### Phase 8: Advanced Features
- Bid withdrawal before deadline
- Minimum bid increments
- Reserve prices (encrypted)
- Bidder reputation system

### Phase 9: Ecosystem Integration
- NFT marketplace plugins
- DeFi liquidation auctions
- DAO governance voting
- Cross-chain auctions via LayerZero

### Phase 10: Mainnet Launch
- Deploy to Fhenix mainnet
- Audit contracts
- Bug bounty program
- Governance token

## Team

**Abdul Gofur** — Full-stack developer with AI-augmented approach. Specialized in blockchain development and privacy-preserving technologies. Built ShadowBid as a demonstration of FHE's potential to solve real-world DeFi problems.

## Demo

Try the live demo on Arbitrum Sepolia:
1. Connect wallet to Arbitrum Sepolia
2. Visit the Demo route
3. Click "Load Demo Auctions" to create sample auctions
4. Place encrypted bids
5. Finalize and reveal winners

**Contract**: [0x96dA01145BE15b12e659630b4E4597Cb626Ff447](https://sepolia.arbiscan.io/address/0x96dA01145BE15b12e659630b4E4597Cb626Ff447)

## Conclusion

ShadowBid proves that FHE enables new paradigms in on-chain auctions. By keeping bids encrypted while allowing computation, we eliminate MEV, protect bidder privacy, and create a fair auction environment — all without trusted parties or off-chain computation.

This is just the beginning. FHE has applications in voting, identity, finance, and beyond. ShadowBid is a practical demonstration of what's possible when computation meets encryption.
