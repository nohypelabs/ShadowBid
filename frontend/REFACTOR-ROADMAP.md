# ShadowBid Frontend — Refactor Roadmap

> Comprehensive refactor plan for ShadowBid dApp frontend. All changes are UI-only — smart contract logic untouched.

---

## Phase 0: CSS Foundation ✅ DONE

### Problem
- Single 4,400-line `index.css` monolith
- Light theme contamination (`#0f172a`, `rgba(255,255,255,0.5)`)
- Hardcoded fonts (`Inter`, `IBM Plex Mono`, `Syne`)
- Rounded pill aesthetic (16-20px border-radius)
- Duplicate CSS rules across files

### Solution
- Split into 22 modular CSS files under `src/styles/`
- New design tokens: `--gold` (#C9922A), `--cipher` (#1AFFE4), `--bg-void` (#02030A)
- Fonts: Barlow Condensed / Barlow / Geist Mono
- Sharp corners (3-6px border-radius)
- Dark glass surfaces (`rgba(255,255,255,0.03)`)

### Files
```
src/styles/
├── variables.css          — Design tokens (:root)
├── base.css               — Reset, body, scrollbar
├── animations.css         — Keyframes
├── responsive.css         — All breakpoints
├── components/
│   ├── sidebar.css        — Sidebar navigation
│   ├── topbar.css         — Top bar
│   ├── dashboard-layout.css — Layout shell
│   ├── buttons.css        — btn-primary, btn-ghost
│   ├── badges.css         — Status badges
│   ├── cards.css          — Glass cards, panels
│   ├── forms.css          — Inputs
│   ├── timer.css          — Countdown timer
│   ├── stat-card.css      — Metric chips, icon utils
│   ├── focus.css          — Accessibility
│   └── overflow-fix.css   — Overflow protection
└── pages/
    ├── dashboard.css      — Dashboard page
    ├── home.css           — Shared (search, panel link)
    ├── auctions.css       — Active auctions
    ├── create.css         — Create auction
    ├── detail.css         — Auction detail
    ├── demo.css           — Demo page
    └── not-found.css      — 404 page
```

---

## Phase 1: Dead Code Removal ✅ DONE

### Removed
| Item | Lines | Reason |
|------|-------|--------|
| `AuctionCard.tsx` | 97 | Never imported — replaced by inline rows |
| `ErrorBoundary.tsx` | 105 | Never rendered anywhere |
| `StatCard.tsx` | 87 | Never imported — MetricChip used instead |
| `StatsGrid.tsx` | 23 | Never imported |
| `Header.tsx` | 247 | Replaced by Sidebar + Topbar |
| `Footer.tsx` | 39 | Not in dashboard design |
| `toast.css` | 100 | App uses `sonner`, not custom toast |
| `error-boundary.css` | 165 | Component deleted |
| `header.css` | 483 | Replaced by sidebar.css + topbar.css |
| Dead CSS classes | ~100 | 20+ unused classes removed |
| Dead JS (`no-glass`) | 9 | Referenced undefined CSS class |

**Total: ~1,455 lines removed**

---

## Phase 2: Shared Utilities ✅ DONE

### Extracted
| File | Exports | Used By |
|------|---------|---------|
| `src/utils/format.ts` | `shortAddr`, `formatEth` | Home, AuctionDetail, ActiveAuctions, Settlement |
| `src/utils/auction.ts` | `parseAuction`, `ZERO_ADDRESS` | Home, AuctionDetail, ActiveAuctions, MyBids, RevealCenter, Settlement, Verification |
| `src/hooks/useCurrentTimestamp.ts` | `useCurrentTimestamp` | Home, AuctionDetail, ActiveAuctions, Verification |

### Before → After
- `shortAddr` defined in 2 files with different implementations → 1 shared function
- `formatEth` defined inline → shared utility
- `ZERO_ADDRESS` defined in 2 files → shared constant
- Auction tuple parsing in 3 files → `parseAuction()` helper
- Timestamp interval in 4 components → `useCurrentTimestamp()` hook

---

## Phase 3: Hardcoded Colors → CSS Variables ✅ DONE

### Problem
31 hardcoded color instances in TSX files:
- `color="#f59e0b"` (old amber)
- `color="#06b6d4"` (old cyan)
- `color="#10b981"` (old green)
- `rgba(245,158,11,0.1)` (inline styles)

### Solution
- CSS utility classes: `.icon-gold`, `.icon-cipher`, `.icon-green`, `.icon-red`, `.icon-muted`, `.icon-dim`
- Accent variants: `.sb-stat-card--gold`, `.sb-metric-chip--cipher`, etc.
- Protocol step variants: `.sb-protocol__step-icon--gold`, `--cipher`, `--green`

### Result
**0 hardcoded colors** in TSX (except confetti which needs literal values)

---

## Phase 4: Dashboard Layout Refactor ✅ DONE

### New Architecture
```
┌─ Topbar (search, network, wallet) ─────────────────┐
├─ Sidebar ─┬─ Main Content (scrollable) ────────────┤
│ Dashboard │  <Outlet /> (page content)              │
│ Auctions  │                                          │
│ My Bids   │                                          │
│ Reveal    │                                          │
│ Settlement│                                          │
│ Verify    │                                          │
└───────────┴──────────────────────────────────────────┘
```

### New Components
| Component | Purpose |
|-----------|---------|
| `Sidebar.tsx` | Navigation, brand, collapse toggle, contract link |
| `Topbar.tsx` | Search bar, network badge, wallet button (RainbowKit) |
| `DashboardLayout.tsx` | Wrapper with Sidebar + Topbar + Outlet, mobile responsive |

### New Pages
| Page | Route | Contract Queries |
|------|-------|-----------------|
| `MyBids.tsx` | `/my-bids` | `auctions`, `bids`, `getBidderDeposit` |
| `RevealCenter.tsx` | `/reveal` | `auctions`, `getBidderCount` |
| `Settlement.tsx` | `/settlement` | `auctions`, `isPaymentClaimed` |
| `Verification.tsx` | `/verification` | `auctions`, `getBidderCount` |

### Dashboard Page (Home.tsx)
- Title: "Confidential Auction Command Center"
- Quick actions: Create Auction + Place Sealed Bid
- Stats row: Active Auctions, Total Locked, Reveal Due, Privacy
- Featured Active Auction card
- Auction Phase Timeline (Commit → Reveal → Settle)
- Live Auctions table
- My Sealed Bid Status
- Verification Feed

---

## Phase 5: Polish & Responsive ✅ DONE

### Responsive Breakpoints
| Breakpoint | Behavior |
|-----------|----------|
| `>1024px` | Full sidebar (240px) + content |
| `769-1024px` | Collapsed sidebar (64px) + content |
| `<769px` | Sidebar hidden (drawer toggle) + full-width content |
| `<640px` | Mobile optimizations |

### Mobile
- Sidebar becomes drawer (slide from left)
- Overlay backdrop when open
- Toggle button in sidebar bottom
- Topbar search collapses

---

## Future Phases (Not Yet Implemented)

### Phase 6: Component Extraction
- Extract `DashboardStat`, `FeaturedAuction`, `AuctionPhaseTimeline` from Home.tsx into separate files
- Extract `LiveAuctionsTable`, `MySealedBidStatus`, `VerificationFeed` into components
- Create shared `DataTable` component for reusable table patterns

### Phase 7: State Management
- Consider Zustand or React Context for global state
- Cache contract reads (auction list, user bids)
- Optimistic UI updates for transactions

### Phase 8: Advanced Features
- Real-time event listening (wagmi `watchContractEvent`)
- Bid history with pagination
- Auction search with filters (status, phase, date)
- Dark/light theme toggle
- Notification system for reveal deadlines

### Phase 9: Testing
- Unit tests for `format.ts`, `auction.ts` utilities
- Component tests for Sidebar, Topbar, DashboardLayout
- Integration tests for contract read flows
- E2E tests for create → bid → reveal → settle flow

### Phase 10: Performance
- Code splitting per route (React.lazy)
- Image optimization (shadowbid.png)
- Service worker for offline support
- Lighthouse audit and optimization

---

## File Inventory (Current State)

### Components (6)
```
src/components/
├── BackToTop.tsx          — Floating scroll-to-top button
├── CofheBridge.tsx        — CoFHE provider + Sonner toaster
├── CountdownTimer.tsx     — Live countdown with progress bar
├── DashboardLayout.tsx    — Sidebar + Topbar + Outlet wrapper
├── Sidebar.tsx            — Navigation sidebar
├── Topbar.tsx             — Top bar with search + wallet
└── index.ts               — Barrel export
```

### Pages (10)
```
src/pages/
├── Home.tsx               — Dashboard (stats, tables, feed)
├── ActiveAuctions.tsx     — Searchable auction list
├── CreateAuction.tsx      — Create auction form
├── AuctionDetail.tsx      — Full auction lifecycle
├── MyBids.tsx             — User's sealed bids
├── RevealCenter.tsx       — Auctions awaiting reveal
├── Settlement.tsx         — Payment/refund claims
├── Verification.tsx       — On-chain verification feed
├── Demo.tsx               — Pre-filled templates
├── NotFound.tsx           — 404 page
└── index.ts               — Barrel export
```

### Utils & Hooks
```
src/utils/
├── format.ts              — shortAddr, formatEth
└── auction.ts             — parseAuction, ZERO_ADDRESS

src/hooks/
└── useCurrentTimestamp.ts — 1-second interval timestamp
```

### CSS (22 files, 3,310 lines)
```
src/styles/
├── variables.css (81)
├── base.css (51)
├── animations.css (63)
├── responsive.css (121)
├── components/
│   ├── sidebar.css (191)
│   ├── topbar.css (161)
│   ├── dashboard-layout.css (50)
│   ├── buttons.css (91)
│   ├── badges.css (46)
│   ├── cards.css (63)
│   ├── forms.css (42)
│   ├── timer.css (125)
│   ├── stat-card.css (93)
│   ├── focus.css (52)
│   └── overflow-fix.css (22)
└── pages/
    ├── dashboard.css (414)
    ├── home.css (49)
    ├── auctions.css (297)
    ├── create.css (267)
    ├── detail.css (646)
    ├── demo.css (293)
    └── not-found.css (92)
```

---

## Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| CSS lines | 4,483 | 3,310 | -1,173 (26%) |
| Components | 7 | 6 | -1 |
| Pages | 6 | 10 | +4 |
| Hardcoded colors (TSX) | 31 | 0 | -31 |
| Dead components | 4 | 0 | -4 |
| Duplicate utilities | 4 patterns | 0 | -4 |
| Inline timestamps | 4 | 0 | -4 |
| Build time | ~3s | ~2.5s | -17% |
