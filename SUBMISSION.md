# ShadowBid – Privacy-First Sealed-Bid Auctions

## What it does

ShadowBid enables users to create and participate in sealed-bid auctions where all bids are encrypted with FHE (Fully Homomorphic Encryption) before being stored on-chain. Bids remain completely private until the auction ends and the reveal phase begins, ensuring no one can front-run or snipe bids.

**Core value proposition:** Public Asset. Private Bids. Verifiable Settlement.

The product communicates this clearly:
- **Public:** Asset details, auction timing, bidder count — visible to everyone
- **Private:** Bid amounts, reserve price, winner identity — encrypted with FHE
- **Verified:** Winner revealed via Threshold Network cryptographic proof

## The problem it solves

Traditional on-chain auctions expose bid amounts, making them vulnerable to front-running, bid sniping, and manipulation. ShadowBid eliminates these issues by keeping bids encrypted until all participants have committed, guaranteeing mathematical fairness.

The contract uses FHE.select() (CMUX) to compare encrypted bids without ever decrypting them. No trusted party is needed — the computation happens entirely in encrypted space.

## Challenges I ran into

**FHE Integration:** Integrating CoFHE's FHE library with a modern React frontend was initially tricky. The encryption hook threw errors due to undefined step parameters. Solved by using the builder pattern with `encryptInputs().onStep().execute()`.

**Wallet Detection:** Multi-wallet detection issues (MetaMask vs. OKX vs. Phantom) required upgrading to RainbowKit v2's EIP-6963 support.

**Design System:** Building an institutional dark design that communicates trust — not a crypto casino aesthetic. Used Geist fonts, teal accent (#2DD4BF), and careful spacing. Custom CSS instead of heavy Tailwind.

**Loading States:** Blockchain data loads asynchronously. Initial implementation showed fake zeros (e.g., "0 bidders" while loading). Fixed with proper loading skeletons and undefined checks.

**TFHE WASM Loading:** The FHE library sometimes fails to load from Fhenix infrastructure on testnet. Added clear error handling and user-facing messages.

## Technologies I used

| Layer | Technology |
|-------|------------|
| Smart Contracts | Solidity 0.8.28, Fhenix CoFHE, OpenZeppelin ReentrancyGuard |
| Dev Tooling | Hardhat, @cofhe/hardhat-plugin |
| Frontend | React 19, Vite, TypeScript |
| Wallet | RainbowKit v2.2.11, Wagmi v2.9.0, EIP-6963 |
| FHE Client | @cofhe/sdk + @cofhe/react |
| Styling | Custom CSS (Geist fonts, institutional dark palette) |
| Animation | Framer Motion |
| Icons | lucide-react |
| Chain | Arbitrum Sepolia (chainId: 421614) |

## How we built it

**Smart Contract:** Single Solidity contract (~430 lines) deployed on Arbitrum Sepolia. Uses euint64 (encrypted uint64) and eaddress (encrypted address) types. FHE.select() for CMUX operations, FHE.allowPublic() for post-finalization decryption. ReentrancyGuard on payment/refund functions. 47 tests passing with CoFHE mock coprocessor.

**Frontend:** React SPA with 11 pages — Home, CreateAuction, AuctionDetail, ActiveAuctions, MyBids, RevealCenter, Settlement, Verification, Docs, Demo, NotFound. Custom design system with Geist Sans + Geist Mono fonts, institutional dark palette, standardized buttons/cards/badges.

**Encryption Flow:** Client-side encryption via CoFHE SDK before transaction submission. `encryptInputs()` produces InEuint64 struct (ctHash, securityZone, utype, signature) which is passed to the contract.

**Wallet Integration:** RainbowKit v2 with EIP-6963 support. Multiple wallets supported: MetaMask, Phantom, Brave, Rainbow, Coinbase, WalletConnect.

## What we learned

**FHE UX:** FHE operations are async and can fail (WASM loading). Users need clear feedback — loading states, error messages, progress indicators. Never show fake zeros.

**Design Matters:** Institutional design builds trust. "Crypto casino" aesthetics scare serious users. Geist fonts, muted colors, and clear hierarchy communicate professionalism.

**Privacy Messaging:** Users need to understand what's public vs. private. Added Privacy Model section (Public/Private/Verified) to Home and AuctionDetail pages.

**Testing:** CoFHE mock coprocessor makes testing FHE contracts practical. 47 tests cover the full auction lifecycle — create, bid, finalize, reveal, claim.

**Blockchain UX:** Loading states are critical. Blockchain queries take 2-5 seconds. Without proper loading indicators, users think the app is broken.

## What's next for ShadowBid

**Smart Contract (Phase 8):**
- Bid amount = ETH deposit enforcement (prevent game-theoretic exploit)
- Auction cancellation function
- Bid withdrawal function
- Title length limit

**Frontend:**
- IPFS image upload (currently data URLs)
- Off-chain metadata storage (description, category)
- Multi-chain support

**Product:**
- Mainnet deployment on Arbitrum One
- Security audit
- Open-source the full stack for community contributions
