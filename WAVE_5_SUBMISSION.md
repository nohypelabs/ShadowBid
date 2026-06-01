# ShadowBid – Wave 5 Update

## What It Does

ShadowBid is a sealed-bid auction protocol where bids stay encrypted on-chain using Fully Homomorphic Encryption (FHE). The contract compares encrypted bids via FHE CMUX operations without ever decrypting them — only the winner is revealed after settlement.

**Public Asset. Private Bids. Verifiable Settlement.**

## Key Updates (Wave 5)

### Smart Contract
- Deployed on Arbitrum Sepolia with full auction lifecycle: create, bid, finalize, reveal, claim
- FHE integration via CoFHE: euint64 for bids, eaddress for winner, FHE.select() for CMUX comparison
- ReentrancyGuard on payment/refund functions, MAX_BIDDERS cap (500), custom errors
- 47 tests passing (Hardhat + CoFHE mock coprocessor)

### Frontend
- 11 pages: Home, CreateAuction, AuctionDetail, ActiveAuctions, MyBids, RevealCenter, Settlement, Verification, Docs, Demo, NotFound
- FHE encryption in-browser via CoFHE SDK before transaction submission
- RainbowKit v2 with EIP-6963 support (MetaMask, OKX, Phantom, WalletConnect)
- Functional search: filter auctions by title in header
- Bid confirmation dialog with wallet balance check
- Breadcrumb navigation on auction detail pages

### Design System
- Institutional dark palette: #050608 backgrounds, #2DD4BF teal accent
- Geist Sans + Geist Mono typography
- Standardized buttons (primary, secondary, ghost), cards (16px radius), badges (pill style)
- Header (64px, blur backdrop), sidebar (248px, teal active indicator), footer (Wave 5 tagline)
- Responsive: 390px, 768px, 1440px breakpoints

### UX Polish
- Privacy Model section on Home + AuctionDetail (Public/Private/Verified)
- Empty states with clear guidance across all pages
- Loading skeletons (no fake zeros while data loads)
- Contextual help for Reserve Price, Finalize, Reveal flows
- Error handling for TFHE WASM failures and network issues

## Challenges

- CoFHE FHE library integration: initial encryption hook errors due to undefined step parameters. Solved with builder pattern.
- Multi-wallet detection: MetaMask vs OKX vs Phantom conflicts. Resolved with RainbowKit v2 EIP-6963.
- Loading states: blockchain queries take 2-5 seconds. Without skeletons, users see fake zeros. Fixed with proper undefined checks.
- TFHE WASM loading: FHE library sometimes fails on testnet. Added clear error messages.

## What's Next

- Bid amount = ETH deposit enforcement (requires contract change)
- IPFS image upload (currently data URLs)
- Off-chain metadata storage
- Security audit and mainnet deployment

## Links

- Demo: https://shadowbid26.vercel.app
- GitHub: https://github.com/nohypelabs/shadowbid
- X: https://x.com/nohypelabs
- Telegram: https://t.me/nohypelabs
