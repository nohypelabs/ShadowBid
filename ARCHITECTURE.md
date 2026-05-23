# ShadowBid Architecture

## Smart Contract Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SHADOWBID CONTRACT                                 │
│                          0xF801Bb64c6f396e431ad0C3b8D8770BC028fF0D1           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Seller     │
│              │
│ createAuction│─────────────────────────────────────────────────────┐
│ (title,      │                                                     │
│  duration,   │                                                     │
│  minBid)     │                                                     │
└──────────────┘                                                     │
                                                                     │
                                                                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Bidder 1   │    │   Bidder 2   │    │   Bidder 3   │    │   Bidder N   │
│              │    │              │    │              │    │              │
│ placeBid     │    │ placeBid     │    │ placeBid     │    │ placeBid     │
│ (encrypted)  │    │ (encrypted)  │    │ (encrypted)  │    │ (encrypted)  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │                   │
       │                   │                   │                   │
       └───────────────────┴───────────────────┴───────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Contract    │
                    │  Stores      │
                    │  Encrypted   │
                    │  Bids as     │
                    │  euint64     │
                    └──────┬───────┘
                           │
                           │ (bidding ends)
                           │
                           ▼
                    ┌──────────────┐
                    │   Seller     │
                    │              │
                    │  finalize()  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Contract    │
                    │  Compares    │
                    │  Encrypted   │
                    │  Bids via    │
                    │  FHE CMUX    │
                    └──────┬───────┘
                           │
                           │ (finds highest)
                           │
                           ▼
                    ┌──────────────┐
                    │  Contract    │
                    │  Stores      │
                    │  Winner as   │
                    │  Encrypted   │
                    └──────┬───────┘
                           │
                           │ (seller requests permit)
                           │
                           ▼
                    ┌──────────────┐
                    │  Fhenix      │
                    │  Threshold   │
                    │  Network     │
                    │  Issues      │
                    │  Permit      │
                    └──────┬───────┘
                           │
                           │ (permit granted)
                           │
                           ▼
                    ┌──────────────┐
                    │   Seller     │
                    │              │
                    │ revealWinner │
                    │ (with permit)│
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Contract    │
                    │  Decrypts    │
                    │  Winner &    │
                    │  Winning Bid │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Winner     │
                    │  Revealed    │
                    │  (Losing     │
                    │   bids stay │
                    │   encrypted)│
                    └──────────────┘
```

## Encryption Flow

### Bid Submission

```
┌─────────────┐
│   Client    │
│   Browser   │
└──────┬──────┘
       │
       │ 1. User enters bid amount (e.g., 0.5 ETH)
       │
       ▼
┌─────────────┐
│ CoFHE SDK   │
│ @cofhe/react│
└──────┬──────┘
       │
       │ 2. encryptUint64(0.5 * 1e18)
       │    - Generates random encryption key
       │    - Encrypts value using FHE scheme
       │    - Returns ciphertext with metadata
       │
       ▼
┌─────────────┐
│  Encrypted  │
│  Data       │
│  {          │
│   ctHash,   │
│   security  │
│   Zone,     │
│   utype,    │
│   signature │
│  }          │
└──────┬──────┘
       │
       │ 3. Submit to contract
       │    - Convert to inEuint64 format
       │    - Include signature for verification
       │
       ▼
┌─────────────┐
│  Contract   │
│  placeBid() │
└──────┬──────┘
       │
       │ 4. Store encrypted bid
       │    - Verify signature
       │    - Store ciphertext in mapping
       │    - Increment bidder count
       │
       ▼
┌─────────────┐
│  Blockchain │
│  State      │
└─────────────┘
```

### Winner Selection & Decryption

```
┌─────────────┐
│   Seller    │
│  finalize() │
└──────┬──────┘
       │
       │ 1. End bidding period
       │    - Set biddingEnd timestamp
       │    - Mark auction as finalized
       │
       ▼
┌─────────────┐
│  Contract   │
│  FHE CMUX   │
└──────┬──────┘
       │
       │ 2. Compare encrypted bids
       │    - Use FHE comparison operations
       │    - Find maximum encrypted value
       │    - Output still encrypted
       │
       ▼
┌─────────────┐
│  Encrypted  │
│  Winner     │
│  (ctHash)   │
└──────┬──────┘
       │
       │ 3. Request decryption permit
       │    - Submit ctHash to Fhenix
       │    - Threshold Network approves
       │
       ▼
┌─────────────┐
│  Fhenix     │
│  Threshold  │
│  Network    │
└──────┬──────┘
       │
       │ 4. Issue permit
       │    - Multi-party signature
       │    - Time-limited authorization
       │
       ▼
┌─────────────┐
│   Seller    │
│revealWinner()│
└──────┬──────┘
       │
       │ 5. Submit permit to contract
       │    - Contract validates permit
       │    - Calls FHE decryption
       │
       ▼
┌─────────────┐
│  Contract   │
│  Decrypt    │
└──────┬──────┘
       │
       │ 6. Reveal winner
       │    - Decrypt winning bid amount
       │    - Decrypt winning bidder address
       │    - Store in revealedBid, revealedWinner
       │
       ▼
┌─────────────┐
│  Winner     │
│  Revealed    │
│  (Losing     │
│   bids stay │
│   encrypted)│
└─────────────┘
```

## Data Flow for Bid Submission

### 1. Client-Side Encryption

```typescript
// Frontend: useCofheEncrypt hook
const { encryptInputsAsync } = useCofheEncrypt();

const encryptedResults = await encryptInputsAsync({
  items: [
    {
      value: BigInt(Math.round(bidAmount * 1e18)),
      type: 'uint64',
      label: 'bidAmount',
    },
  ],
});

const encrypted = encryptedResults[0];
// Returns: { ctHash, securityZone, utype, signature }
```

### 2. Contract Submission

```solidity
// Contract: placeBid function
function placeBid(uint256 auctionId, inEuint64 calldata encryptedBid) external {
    // Verify bidder hasn't already bid
    require(!bids[auctionId][msg.sender].exists, "Already bid");

    // Verify auction is active
    require(block.timestamp < auctions[auctionId].biddingEnd, "Auction ended");

    // Store encrypted bid
    bids[auctionId][msg.sender] = Bid({
        exists: true,
        encryptedBid: encryptedBid
    });

    // Increment bidder count
    bidderCount[auctionId]++;
}
```

### 3. On-Chain Storage

```
Mapping Structure:
bids[auctionId][bidderAddress] = {
    exists: bool,
    encryptedBid: inEuint64 {
        ctHash: bytes32,      // Ciphertext hash
        securityZone: uint8,  // Security zone identifier
        utype: uint8,         // Encryption type
        signature: bytes      // CoFHE signature
    }
}
```

## Data Flow for Winner Selection

### 1. Finalization

```solidity
// Contract: finalize function
function finalize(uint256 auctionId) external {
    // Verify caller is seller
    require(msg.sender == auctions[auctionId].seller, "Not seller");

    // Verify auction has ended
    require(block.timestamp >= auctions[auctionId].biddingEnd, "Not ended");

    // Verify not already finalized
    require(!auctions[auctionId].finalized, "Already finalized");

    // Mark as finalized
    auctions[auctionId].finalized = true;
}
```

### 2. FHE Comparison (Simplified)

```solidity
// Contract: internal FHE comparison
function _findHighestBid(uint256 auctionId) internal returns (inEuint64 memory, address) {
    inEuint64 memory highestBid;
    address highestBidder;

    // Iterate through all bidders
    for (address bidder = _getFirstBidder(auctionId); 
         bidder != address(0); 
         bidder = _getNextBidder(auctionId, bidder)) {
        
        inEuint64 memory currentBid = bids[auctionId][bidder].encryptedBid;

        // FHE comparison: currentBid > highestBid
        if (FHE.cmux(FHE.gt(currentBid, highestBid), currentBid, highestBid) == currentBid) {
            highestBid = currentBid;
            highestBidder = bidder;
        }
    }

    return (highestBid, highestBidder);
}
```

### 3. Decryption with Permit

```solidity
// Contract: revealWinner function
function revealWinner(uint256 auctionId, bytes calldata permit) external {
    // Verify auction is finalized
    require(auctions[auctionId].finalized, "Not finalized");

    // Verify caller is seller
    require(msg.sender == auctions[auctionId].seller, "Not seller");

    // Get highest bid ciphertext
    inEuint64 memory highestBid = _getHighestBid(auctionId);
    address highestBidder = _getHighestBidder(auctionId);

    // Decrypt using permit
    uint256 revealedBidAmount = FHE.decrypt(highestBid, permit);
    address revealedBidder = FHE.decryptAddress(highestBidderCtHash, permit);

    // Store revealed values
    auctions[auctionId].revealedBid = revealedBidAmount;
    auctions[auctionId].revealedWinner = revealedBidder;
}
```

## Contract Functions

### Core Functions

#### `createAuction(string title, uint256 duration, inEuint64 minimumBid)`
- **Purpose**: Create a new sealed-bid auction
- **Parameters**:
  - `title`: Human-readable auction description
  - `duration`: Bidding period in seconds
  - `minimumBid`: Encrypted minimum bid (euint64)
- **Returns**: `auctionId` (uint256)
- **Emits**: `AuctionCreated(auctionId, seller, title, biddingEnd)`
- **Gas**: ~150,000

#### `placeBid(uint256 auctionId, inEuint64 encryptedBid)`
- **Purpose**: Submit an encrypted bid to an auction
- **Parameters**:
  - `auctionId`: ID of auction to bid on
  - `encryptedBid`: Encrypted bid amount (euint64)
- **Requirements**:
  - Bidder hasn't already bid
  - Auction is active (not ended)
  - Bid is properly encrypted with valid signature
- **Emits**: `BidPlaced(auctionId, bidder)`
- **Gas**: ~120,000

#### `finalize(uint256 auctionId)`
- **Purpose**: End bidding period and prepare for winner selection
- **Parameters**:
  - `auctionId`: ID of auction to finalize
- **Requirements**:
  - Caller is the seller
  - Auction has ended (timestamp >= biddingEnd)
  - Not already finalized
- **Emits**: `AuctionFinalized(auctionId)`
- **Gas**: ~50,000

#### `revealWinner(uint256 auctionId, bytes permit)`
- **Purpose**: Decrypt and reveal the winning bid and bidder
- **Parameters**:
  - `auctionId`: ID of auction to reveal
  - `permit`: Fhenix Threshold Network permit for decryption
- **Requirements**:
  - Auction is finalized
  - Caller is the seller
  - Permit is valid and not expired
- **Emits**: `WinnerRevealed(auctionId, winner, winningBid)`
- **Gas**: ~200,000

### View Functions

#### `getBidderCount(uint256 auctionId)`
- **Purpose**: Get total number of bidders for an auction
- **Returns**: `uint256` count

#### `getHighestBidCtHash(uint256 auctionId)`
- **Purpose**: Get ciphertext hash of the highest bid
- **Returns**: `bytes32` ctHash

#### `getHighestBidderCtHash(uint256 auctionId)`
- **Purpose**: Get ciphertext hash of the highest bidder
- **Returns**: `bytes32` ctHash

#### `auctions(uint256 auctionId)`
- **Purpose**: Get full auction details
- **Returns**: Auction struct with all fields

#### `bids(uint256 auctionId, address bidder)`
- **Purpose**: Check if a bidder has submitted a bid
- **Returns**: Bid struct (exists flag and encrypted bid)

## Frontend Structure

### Directory Layout

```
frontend/
├── src/
│   ├── components/
│   │   ├── AuctionCard.tsx          # Auction card display with skeleton
│   │   ├── CountdownTimer.tsx       # Timer with status badges
│   │   ├── ErrorBoundary.tsx        # Error boundary with fallback
│   │   ├── TransactionToast.tsx     # Transaction status toast
│   │   └── index.ts                 # Component exports
│   ├── pages/
│   │   ├── Home.tsx                 # Homepage with auction grid
│   │   ├── CreateAuction.tsx        # Auction creation form
│   │   ├── AuctionDetail.tsx        # Individual auction view
│   │   ├── Demo.tsx                 # Demo mode with pre-seeded auctions
│   │   └── index.ts                 # Page exports
│   ├── constants/
│   │   └── contracts.ts             # Contract addresses and ABIs
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   ├── App.tsx                      # Main app with routing
│   ├── main.tsx                     # Entry point with providers
│   ├── wagmi.ts                     # wagmi configuration
│   └── index.css                    # Global styles
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### Component Architecture

#### AuctionCard
- **Props**: `auction: AuctionWithId`, `bidCount: number`, `isLoading?: boolean`
- **Features**:
  - Displays auction title, time remaining, bid count, status
  - CountdownTimer integration with status badges
  - Loading skeleton for async states
  - Hover effects and smooth transitions
  - Click to navigate to auction detail

#### CountdownTimer
- **Props**: `endTime: bigint`, `isFinalized?: boolean`, `compact?: boolean`
- **Features**:
  - Real-time countdown with 1-second updates
  - Status badges: Active (green), Ending Soon (orange), Ended (red), Finalizing (yellow)
  - Compact mode for card display
  - Pulse animation for urgent states
  - Auto-refresh on completion

#### ErrorBoundary
- **Features**:
  - Catches React component errors
  - Displays user-friendly error message
  - Retry button to reload page
  - ContractErrorFallback for contract-specific errors
  - Graceful degradation

#### TransactionToast
- **Props**: `txHash`, `status`, `message`, `onClose`, `autoClose`
- **Features**:
  - Pending/Confirmed/Failed states
  - Arbiscan link for transaction details
  - Auto-close on success
  - Smooth animations
  - Note: Replaced with sonner toast integration

### Page Architecture

#### Home
- **Features**:
  - Hero section with gradient text
  - Stats grid (Total Auctions, Active, Network, Your Address)
  - "How It Works" section with 3 steps and icons
  - Action buttons (Create Auction, Try Demo)
  - Auction grid with responsive layout
  - Loading skeletons for async data
  - Empty state with CTA

#### CreateAuction
- **Features**:
  - Form with title, duration, minimum bid
  - Client-side encryption via CoFHE SDK
  - Form validation
  - Loading states during encryption and transaction
  - Toast notifications for success/error
  - Auto-redirect to home on success

#### AuctionDetail
- **Features**:
  - Full auction information display
  - CountdownTimer with status
  - Encrypted bid display (decrypts for winner)
  - Bid submission form (if active and user hasn't bid)
  - Finalize button (for seller after auction ends)
  - Reveal button (after finalization)
  - Toast notifications for all transactions
  - Error handling for decryption failures

#### Demo
- **Features**:
  - Demo mode banner with explanation
  - "Load Demo Auctions" button
  - Pre-seeded auction templates (3 different states)
  - Creates auctions on-chain with FHE encryption
  - Displays current auctions
  - Toast notifications for batch creation
  - Empty state with CTA

### State Management

#### wagmi Hooks
- `useAccount` - Wallet connection status
- `useReadContract` - Read contract state
- `useWriteContract` - Write to contract
- `useWaitForTransactionReceipt` - Transaction confirmation

#### CoFHE Hooks
- `useCofheEncrypt` - Client-side encryption
- `useCofheClient` - FHE client for decryption
- `CofheProvider` - Context provider for FHE operations

#### React State
- Form inputs (title, duration, bid amount)
- Loading states (encrypting, submitting, confirming)
- Error states (validation, transaction, decryption)
- Toast state (sonner integration)

### Styling

#### Tailwind Configuration
```javascript
colors: {
  background: '#0a0a0a',
  card: '#111111',
  border: '#1f1f1f',
  accent: '#6366f1',
  'accent-hover': '#4f46e5',
}
```

#### Responsive Breakpoints
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)

#### Animation
- Framer Motion for page transitions
- Tailwind transitions for hover effects
- Pulse animations for urgent states
- Skeleton loading animations

## Security Considerations

### Encryption
- All bids encrypted client-side before submission
- CoFHE SDK uses industry-standard FHE schemes
- Encryption keys generated per-session
- Signatures prevent ciphertext tampering

### Contract Security
- Access control (only seller can finalize/reveal)
- Timestamp validation for auction periods
- Bid deduplication (one bid per bidder)
- Permit validation for decryption

### Threshold Network
- Multi-party computation for decryption
- No single point of compromise
- Time-limited permits prevent replay attacks
- Distributed key management

### Privacy
- Losing bids never revealed
- Only winner decrypted after permit
- Bidder addresses encrypted until reveal
- No off-chain data leakage

## Performance Optimizations

### Gas Optimization
- Efficient storage patterns (mappings)
- Minimal external calls
- Batch operations where possible
- Calldata optimization

### Frontend Optimization
- React.memo for expensive components
- Lazy loading for routes
- Debounced input handling
- Optimistic UI updates

### Network Optimization
- RPC endpoint caching
- Batch contract reads
- WebSocket subscriptions for real-time updates
- Indexed data for complex queries

## Testing Strategy

### Unit Tests
- Contract function testing
- FHE operation testing
- Edge case validation
- Access control verification

### Integration Tests
- Full auction lifecycle
- Multi-bidder scenarios
- Encryption/decryption flow
- Error handling

### E2E Tests
- User journey testing
- Wallet connection flows
- Transaction confirmation
- Error recovery

## Deployment Architecture

### Contract Deployment
- Hardhat deployment scripts
- Automated verification on Arbiscan
- Environment-specific configurations
- Deployment logging and monitoring

### Frontend Deployment
- Vite production build
- Static asset optimization
- CDN distribution
- Environment variable management

### Monitoring
- Contract event monitoring
- Error tracking (Sentry)
- Analytics (user behavior)
- Performance metrics

## Future Extensions

### Contract Enhancements
- Multi-item auctions
- Vickrey (second-price) auctions
- Bid withdrawal mechanism
- Reserve price support
- Bid increment rules

### Frontend Enhancements
- Real-time bid notifications
- Advanced filtering and search
- Bid history visualization
- Mobile app (React Native)
- Accessibility improvements

### Protocol Extensions
- Cross-chain auctions
- NFT integration
- DeFi liquidation auctions
- Governance voting
- Reputation system
