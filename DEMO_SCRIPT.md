# ShadowBid — Demo Script

**Duration:** 5-7 minutes
**Audience:** Fhenix Wave 5 Judges
**Goal:** Demonstrate confidential sealed-bid auctions powered by FHE

---

## Pre-Demo Setup

### Wallets Required
- **Wallet A (Seller):** Has 0.1+ ETH on Arbitrum Sepolia
- **Wallet B (Bidder 1):** Has 0.05+ ETH on Arbitrum Sepolia
- **Wallet C (Bidder 2):** Has 0.05+ ETH on Arbitrum Sepolia

### Browser Setup
- Chrome/Brave with MetaMask
- Clear localStorage for fresh experience
- Open DevTools → Console (for any errors)
- Have Arbiscan ready for contract verification

### Contract
- Deployed on Arbitrum Sepolia
- Address visible in sidebar footer

---

## Opening (30 seconds)

### What to Say
> "ShadowBid is a sealed-bid auction protocol built on Fully Homomorphic Encryption.
> 
> The problem with on-chain auctions today: every bid is visible. Bots front-run you. Competitors see your strategy. Last-minute sniping steals auctions.
>
> ShadowBid solves this. Bids stay encrypted on-chain — even the smart contract can't read them. Only the winner is revealed after settlement."

### What to Show
- Open Home page
- Point to hero: **"Public Asset. Private Bids. Verifiable Settlement."**
- Point to Privacy Model section

---

## Step 1: Privacy Model (30 seconds)

### What to Say
> "Let me break down our privacy model:
> 
> **Public** — everyone can see: the asset being auctioned, when bidding ends, how many bidders.
> 
> **Private** — no one can see: your bid amount, the reserve price, who's winning.
> 
> **Verified** — after settlement, the winner is cryptographically proven via the Threshold Network."

### What to Show
- Home page → Privacy Model section
- Highlight the three columns: Public, Private, Verified
- Colors: blue (public), teal (private), green (verified)

---

## Step 2: Create Auction — Seller Perspective (90 seconds)

### What to Say
> "Let me create an auction as a seller. I'll auction a digital asset."

### What to Do
1. **Connect Wallet A** (seller)
2. **Click "Create Auction"** in sidebar
3. **Fill the form:**
   - Title: "Rare Digital Art Collection"
   - Category: "Digital Art"
   - Description: "Limited edition generative art piece"
   - Reserve Price: "0.01 ETH"
   - Duration: "1 hour"

### What to Say While Filling
> "The reserve price is the minimum ETH deposit required from bidders. Notice the helper text: 'Encrypted on-chain — never revealed.'
> 
> When I submit, the reserve price gets encrypted in-browser using Fhenix CoFHE before it even touches the blockchain. The contract never sees the plaintext value."

### What to Show
- Point to encryption progress bar
- Point to "Encrypted Reserve" badge in summary panel
- Click "Encrypt & Deploy Auction"

### After Transaction Confirms
> "Auction created. The reserve price is now encrypted on-chain. No one — not even me — can read it without the Threshold Network's permission."

---

## Step 3: Browse Auctions — Bidder Perspective (30 seconds)

### What to Do
1. **Switch to Wallet B** (bidder)
2. **Click "Auctions"** in sidebar

### What to Say
> "Now I'm a bidder. I can see active auctions. Notice:
> - I can see the asset image and title — that's public
> - I can see the time remaining and bidder count — also public
> - But I cannot see any bid amounts or the reserve price — that's private"

### What to Show
- ActiveAuctions page
- Point to auction cards
- Click into the auction we just created

---

## Step 4: Place Bid — Encrypted Submission (90 seconds)

### What to Say
> "Let me place a bid. The bid amount will be encrypted in my browser before submission."

### What to Do
1. **Open auction detail page**
2. **Point to the Privacy Model** on the right
3. **Enter bid amount:** "0.02 ETH"
4. **Click "Encrypt & Submit Bid"**

### What to Show — Confirmation Dialog
> "Before submitting, I get a confirmation. I can see my bid amount and my wallet balance. The button is disabled if I don't have enough ETH."

### After Confirm
> "Watch the encryption steps:
> 1. Initializing FHE engine
> 2. Fetching encryption keys
> 3. Packing encrypted bid
> 4. Generating zero-knowledge proof
> 5. Verifying proof
> 
> All of this happens in my browser. The plaintext bid never leaves my device."

### After Transaction Confirms
> "Bid submitted. Let me check Arbiscan — you'll see the encrypted ciphertext hash, but not the actual bid amount. The contract stored `euint64` — an encrypted uint64. It's mathematically impossible to decrypt without the Threshold Network."

---

## Step 5: Second Bidder (30 seconds)

### What to Do
1. **Switch to Wallet C** (bidder 2)
2. **Open same auction**
3. **Place bid:** "0.03 ETH"
4. **Confirm and submit**

### What to Say
> "Second bidder places a higher bid. Same encryption process. Now we have two bids, both encrypted. The contract has already determined the winner using FHE operations — but no one knows who won yet."

### What to Show
- Bidder count increased to 2
- Still no bid amounts visible

---

## Step 6: Finalize — Seller Closes Auction (45 seconds)

### What to Do
1. **Switch to Wallet A** (seller)
2. **Wait for auction to end** (or use short duration)
3. **Click "Finalize Auction"**

### What to Say
> "Bidding period ended. As the seller, I finalize the auction. This does two things:
> 
> 1. Closes bidding permanently — no more bids accepted
> 2. Makes the winner data publicly decryptable via the Threshold Network
> 
> Notice: all bids are still encrypted. Finalization doesn't reveal anything. It just gives permission for the Threshold Network to serve decryption."

### What to Show
- Finalize button appears after bidding ends
- Transaction confirms
- Status changes to "Finalized"

---

## Step 7: Reveal Winner — Cryptographic Proof (45 seconds)

### What to Do
1. **Click "Reveal Winner"** (can be any wallet)

### What to Say
> "Anyone can reveal the winner. The CoFHE SDK decrypts the ciphertext using the Threshold Network's multi-party computation. No single party has the decryption key — it requires a threshold of network participants.
> 
> The contract verifies the signature on-chain. If the signature is valid, the plaintext winner and bid are stored. If someone tries to submit fake data, the transaction reverts."

### What to Show
- Reveal transaction confirms
- "Settlement Result" card appears
- Shows: Winning Bid (0.03 ETH), Winner address

### What to Say After Reveal
> "The winner is now public. But here's the key: **the losing bid was never revealed.** Bidder 1's 0.02 ETH bid stays encrypted forever. Only the winning bid is disclosed."

---

## Step 8: Claim Payment & Refund (30 seconds)

### What to Do
1. **As seller:** Click "Claim Payment"
2. **Switch to Wallet B** (loser)
3. **Click "Claim Refund"**

### What to Say
> "Settlement is straightforward:
> - Seller claims the winner's ETH deposit
> - Losing bidders claim full refunds
> - Refunds are protected by ReentrancyGuard
> - Each bidder can only claim once"

### What to Show
- Seller receives ETH
- Loser receives refund
- Success messages

---

## Closing (30 seconds)

### What to Say
> "Let me summarize what ShadowBid delivers:
> 
> ✅ **Privacy:** Bid amounts encrypted with FHE — never visible during auction
> ✅ **Fairness:** No front-running, no sniping, no bid copying
> ✅ **Verifiability:** Winner proven via Threshold Network cryptographic signatures
> ✅ **Simplicity:** One contract, clean UX, works on Arbitrum Sepolia today
> 
> ShadowBid makes on-chain auctions actually fair. Public asset. Private bids. Verifiable settlement.
> 
> Thank you."

---

## Technical Talking Points (If Asked)

### "How does FHE work here?"
> "We use Fhenix CoFHE — a coprocessor that performs computations on encrypted data. The contract uses `FHE.select()` (CMUX) to compare encrypted bids without decrypting them. It's like a hardware multiplexer: given two encrypted values and an encrypted boolean, it returns one or the other — without knowing which."

### "Why not just use a commit-reveal scheme?"
> "Commit-reveal requires two transactions per bidder and reveals all bids at the end. FHE reveals only the winner. Losing bids stay private forever. Also, commit-reveal is vulnerable to last-minute reveals."

### "What's the gas cost?"
> "FHE operations are more expensive than plaintext — roughly 5-10x. But on Arbitrum, gas is cheap. A full auction lifecycle (create + bid + finalize + reveal) costs under $1."

### "What happens if the Threshold Network is down?"
> "Finalization would still work — it just sets the ACL permission. Reveal would fail until the network is back. Bids remain encrypted and safe."

### "Why euint64? What's the limit?"
> "euint64 supports values up to ~18.4 ETH. For larger auctions, we'd need euint128 or a different unit system. For Wave 5, euint64 is sufficient."

---

## Emergency Fallbacks

### If TFHE WASM Fails to Load
> "This is a known testnet limitation. The FHE library loads from Fhenix's infrastructure. Let me refresh and try again."

### If Transaction Fails
> "Let me check the error. Usually it's insufficient gas or network congestion. Arbitrum Sepolia can be slow sometimes."

### If Bid Form Doesn't Appear
> "This means either: bidding has ended, you're the seller, or you've already bid. Let me check the status."

---

## Demo Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│  1. Home Page — Privacy Model explanation                   │
│  ↓                                                          │
│  2. Create Auction — Seller encrypts reserve price          │
│  ↓                                                          │
│  3. Browse Auctions — Public data visible                   │
│  ↓                                                          │
│  4. Place Bid — FHE encryption in-browser                   │
│  ↓                                                          │
│  5. Second Bid — Multiple encrypted bids                    │
│  ↓                                                          │
│  6. Finalize — Seller closes, allows decryption             │
│  ↓                                                          │
│  7. Reveal — Threshold Network proves winner                │
│  ↓                                                          │
│  8. Settlement — Payment + Refund claims                    │
│  ↓                                                          │
│  9. Closing — Value proposition summary                     │
└─────────────────────────────────────────────────────────────┘
```

---

*Script prepared for Fhenix Wave 5 Buildathon — ShadowBid*
