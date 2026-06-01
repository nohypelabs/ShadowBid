# ShadowBid — Demo Setup Guide

## 1. Demo Auctions Setup

### Prerequisites
- 3 wallets with ETH on Arbitrum Sepolia
- Wallet A (Seller): 0.1+ ETH
- Wallet B (Bidder): 0.05+ ETH
- Wallet C (Bidder): 0.05+ ETH

### Get Testnet ETH
- Alchemy: https://alchemy.com/faucets/arbitrum-sepolia
- Chainlink: https://faucets.chain.link/arbitrum-sepolia

### Create Demo Auctions

Connect **Wallet A (Seller)** and create these auctions:

---

#### Auction 1: NFT Collection
- **Title:** Rare Digital Art Collection
- **Description:** Limited edition generative art piece from renowned digital artist. 1 of 1.
- **Category:** Digital Art
- **Reserve Price:** 0.01 ETH
- **Duration:** 2 hours

---

#### Auction 2: Domain Name
- **Title:** premium-eth.crypto
- **Description:** Premium .crypto blockchain domain name. Short, memorable, brandable.
- **Category:** Domain Names
- **Reserve Price:** 0.005 ETH
- **Duration:** 1 hour

---

#### Auction 3: Software License
- **Title:** Lifetime Pro License — DevTools Suite
- **Description:** Perpetual license for enterprise development tools. Includes all future updates.
- **Category:** Software
- **Reserve Price:** 0.02 ETH
- **Duration:** 3 hours

---

#### Auction 4: Collectible
- **Title:** First Edition Physical Collectible
- **Description:** Authenticated first edition collectible with certificate of authenticity. Physical delivery included.
- **Category:** Collectibles
- **Reserve Price:** 0.015 ETH
- **Duration:** 1 hour

---

### Place Demo Bids

After creating auctions, switch wallets and place bids:

#### Wallet B (Bidder 1)
1. Open Auction 1 (NFT Collection)
2. Place bid: **0.015 ETH**
3. Confirm and wait for transaction

#### Wallet C (Bidder 2)
1. Open Auction 1 (NFT Collection)
2. Place bid: **0.02 ETH**
3. Confirm and wait for transaction

---

### Finalize & Reveal (Optional — for full demo)

If time permits during demo:
1. Wait for auction to end
2. As seller, click "Finalize"
3. Click "Reveal Winner"
4. Show settlement result

---

## 2. Screenshot Checklist

Capture these screens for submission:

### Home Dashboard
- [ ] Full page with stats
- [ ] Privacy Model section visible
- [ ] Active Auctions table
- [ ] My Sealed Bid Status

### Create Auction
- [ ] Empty form
- [ ] Filled form with values
- [ ] Summary panel with badges
- [ ] Encryption progress bar

### Auction Detail
- [ ] Auction info with image
- [ ] Stats cards (Time, Bidders, Seller)
- [ ] Privacy Model section
- [ ] Bid form (Place Your Bid)

### Bid Confirmation
- [ ] Confirmation dialog
- [ ] Balance check visible
- [ ] Confirm/Cancel buttons

### Active Auctions
- [ ] List of auctions
- [ ] Search functionality
- [ ] Status badges

### Settlement
- [ ] Finalize button (seller view)
- [ ] Reveal button
- [ ] Settlement Result card
- [ ] Claim Payment button
- [ ] Claim Refund button

### Mobile (390px width)
- [ ] Home page
- [ ] Auction detail
- [ ] Sidebar hamburger open

### Empty States
- [ ] No auctions (Home)
- [ ] No wallet connected
- [ ] No search results

---

## 3. Screenshot Naming Convention

```
screenshots/
├── 01-home-dashboard.png
├── 02-home-privacy-model.png
├── 03-create-auction-empty.png
├── 04-create-auction-filled.png
├── 05-create-auction-summary.png
├── 06-auction-detail.png
├── 07-bid-form.png
├── 08-bid-confirmation.png
├── 09-active-auctions.png
├── 10-settlement-result.png
├── 11-claim-payment.png
├── 12-mobile-home.png
├── 13-mobile-detail.png
├── 14-empty-state.png
└── 15-footer.png
```

---

## 4. Demo Environment Checklist

Before demo day:

- [ ] All 3 wallets funded
- [ ] 4 demo auctions created
- [ ] At least 2 bids placed on Auction 1
- [ ] Browser cache cleared
- [ ] MetaMask connected to Arbitrum Sepolia
- [ ] DevTools console open (for error monitoring)
- [ ] Arbiscan tab ready (for contract verification)
- [ ] Demo script printed/open on second screen
- [ ] Backup plan if TFHE fails (refresh page)

---

*Setup guide for Fhenix Wave 5 Buildathon — ShadowBid*
