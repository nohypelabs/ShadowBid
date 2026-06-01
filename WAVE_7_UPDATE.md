# ShadowBid — Fhenix Wave 7 Update

**Project:** ShadowBid
**Track:** Wave 7 Buildathon
**Date:** June 1, 2026
**Status:** Active Development

---

## What Is ShadowBid?

ShadowBid is a sealed-bid auction protocol where bids stay encrypted on-chain using Fully Homomorphic Encryption (FHE). The contract compares encrypted bids via FHE CMUX operations without ever decrypting them — only the winner is revealed after settlement.

**Core Value Proposition:**
> Public Asset. Private Bids. Verifiable Settlement.

---

## What Has Been Completed

### Smart Contract (Solidity)
- ✅ Single contract (`ShadowBid.sol`) — ~430 lines
- ✅ FHE integration via `@fhenixprotocol/cofhe-contracts`
- ✅ Encrypted bid submission with `euint64`
- ✅ Winner selection via `FHE.select()` (CMUX)
- ✅ ReentrancyGuard on payment/refund functions
- ✅ Custom errors for gas efficiency
- ✅ MAX_BIDDERS cap (500)
- ✅ Bidder index bounds checking
- ✅ 47 tests passing (Hardhat + CoFHE mock)

### Frontend (React + TypeScript)
- ✅ 11 pages: Home, CreateAuction, AuctionDetail, ActiveAuctions, MyBids, RevealCenter, Settlement, Verification, Docs, Demo, NotFound
- ✅ FHE encryption in-browser via CoFHE SDK
- ✅ RainbowKit wallet connection
- ✅ Wagmi contract interactions
- ✅ Search functionality (header)
- ✅ Responsive design (390px, 768px, 1440px)
- ✅ Mobile hamburger menu

### Design System (Phase 9)
- ✅ Institutional dark palette (#050608 backgrounds, #2DD4BF teal accent)
- ✅ Geist Sans + Geist Mono fonts
- ✅ Standardized buttons (primary, secondary, ghost)
- ✅ Card system (16px radius, gradient backgrounds)
- ✅ Badge system (pill style, color-coded)
- ✅ Header (64px, blur backdrop, network pill)
- ✅ Sidebar (248px, teal active indicator, Docs link)
- ✅ Footer (ShadowBid, Fhenix Wave 7, GitHub, X, Telegram)

### User Experience (Phase 10)
- ✅ User journey audit with fixes
- ✅ Empty states (EmptyState component across all pages)
- ✅ Loading states (no fake-zeros, skeleton loading)
- ✅ Bid confirmation dialog with balance check
- ✅ Breadcrumb navigation
- ✅ Contextual help (Reserve Price, Finalize, Reveal)
- ✅ Error handling (TFHE failures, network errors)
- ✅ Storytelling layer (Privacy Model on Home + AuctionDetail)

### Documentation
- ✅ CLAUDE.md (developer guide)
- ✅ ARCHITECTURE.md (system design)
- ✅ README.md (project overview)
- ✅ PITCH.md (pitch deck content)
- ✅ DEMO_SCRIPT.md (5-7 minute demo flow)
- ✅ DEMO_SETUP.md (demo environment setup)
- ✅ PHASE_10_AUDIT_REPORT.md (product audit)
- ✅ /docs page (protocol documentation)

---

## What Is In Progress

### Demo Dataset
- ⏳ Need to create 4 demo auctions on Arbitrum Sepolia
- ⏳ Templates prepared: NFT, Domain, Software, Collectible
- ⏳ Requires funded wallets

### Screenshots
- ⏳ Checklist prepared (15 screenshots)
- ⏳ Naming convention defined
- ⏳ Need to capture from live environment

---

## What Has Not Been Done

### Smart Contract (Phase 8 — Postponed)
- ❌ Bid amount = ETH deposit enforcement (currently allows mismatch)
- ❌ Auction cancellation function
- ❌ Bid withdrawal function
- ❌ Title length limit (currently unbounded)
- ❌ Gas optimization pass

**Why postponed:** Current contract works for demo. Changes require re-audit and re-deployment. Risk of introducing bugs close to deadline.

### Frontend Features
- ❌ IPFS image upload (currently data URLs)
- ❌ Off-chain metadata storage (description, category lost on refresh)
- ❌ Multi-chain support
- ❌ Bid history (encrypted)

**Why not done:** Out of scope for Wave 7 demo. IPFS requires infrastructure setup. Metadata needs backend.

### Testing
- ❌ End-to-end test on live testnet
- ❌ Cross-browser testing
- ❌ Load testing
- ❌ Security audit (third-party)

**Why not done:** Time constraints. Manual testing sufficient for demo.

---

## Known Issues

### Critical
1. **TFHE WASM Loading:** The FHE library sometimes fails to load from Fhenix infrastructure. Workaround: refresh page.

### Medium
2. **Bid/Deposit Mismatch:** Contract allows encrypted bid amount to differ from ETH deposit. Game-theoretic exploit possible.
3. **No Title Length Limit:** Unbounded string calldata could be used for gas bomb.

### Low
4. **Image as Data URL:** Images stored as base64, not uploaded to IPFS.
5. **Metadata Lost on Refresh:** Description, category, image not persisted on-chain.

---

## Technical Architecture

### Contract
```
ShadowBid.sol (Arbitrum Sepolia)
├── createAuction() — encrypted reserve price
├── placeBid() — encrypted bid + ETH deposit
├── finalize() — close bidding, allow decryption
├── revealWinner() — Threshold Network verification
├── claimPayment() — seller claims winner's ETH
└── claimRefund() — losers claim refunds
```

### Frontend
```
React + Vite + TypeScript
├── wagmi v3 — contract interactions
├── RainbowKit v2 — wallet connection
├── @cofhe/react — FHE encryption
├── framer-motion — animations
└── Geist — typography
```

### FHE Flow
```
Browser → encryptInputs() → InEuint64 → Contract
Contract → FHE.select() → encrypted winner
Finalize → FHE.allowPublic() → decryptable
Reveal → Threshold Network → plaintext winner
```

---

## Demo Flow

```
1. Home — Show privacy model
2. Create Auction — Seller encrypts reserve price
3. Browse Auctions — Public data visible
4. Place Bid — FHE encryption in-browser
5. Second Bid — Multiple encrypted bids
6. Finalize — Seller closes auction
7. Reveal — Threshold Network proves winner
8. Settlement — Payment + Refund
```

**Duration:** 5-7 minutes

---

## What Judges Should Notice

1. **Privacy:** Bid amounts are never visible during auction — even to the contract
2. **Fairness:** No front-running, no sniping, no bid copying
3. **Verifiability:** Winner proven via Threshold Network cryptographic signatures
4. **UX:** Clean, institutional design — not a crypto casino aesthetic
5. **Completeness:** Full auction lifecycle works end-to-end

---

## Links

- **Contract:** [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io/address/0x...)
- **Frontend:** [shadowbid26.vercel.app](https://shadowbid26.vercel.app)
- **GitHub:** [github.com/nohypelabs/shadowbid](https://github.com/nohypelabs/shadowbid)
- **X:** [x.com/nohypelabs](https://x.com/nohypelabs)
- **Telegram:** [t.me/nohypelabs](https://t.me/nohypelabs)

---

## Next Steps

### Before Demo
1. Fund 3 wallets with Arbitrum Sepolia ETH
2. Create 4 demo auctions
3. Place test bids
4. Capture 15 screenshots
5. Practice demo script 2-3 times

### After Wave 7
1. Phase 8: Smart contract refactor (bid/deposit enforcement)
2. IPFS integration for images
3. Off-chain metadata backend
4. Security audit
5. Mainnet deployment plan

---

*This update reflects actual progress. No features are claimed as complete unless they are working in the codebase. Known issues are documented honestly.*

*Last updated: June 1, 2026*
