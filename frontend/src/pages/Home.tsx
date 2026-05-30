import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { motion } from 'framer-motion';
import {
  Lock, ShieldCheck, Trophy, Clock, Users,
  Zap, Plus, Activity, ChevronRight, Eye, Radio,
} from 'lucide-react';
import { CountdownTimer } from '../components';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';
import type { AuctionWithId } from '../types';

export function Home() {
  const { data: auctionCounter, isLoading: isLoadingCounter } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'auctionCounter',
  });

  const totalAuctions = auctionCounter ? Number(auctionCounter) : 0;

  // Animated counter
  const [displayCount, setDisplayCount] = useState(0);
  useEffect(() => {
    if (totalAuctions > 0) {
      const duration = 800;
      const steps = 24;
      const increment = totalAuctions / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= totalAuctions) {
          setDisplayCount(totalAuctions);
          clearInterval(timer);
        } else {
          setDisplayCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [totalAuctions]);

  return (
    <div className="sb-page">
      <div className="sb-bg-blobs">
        <div className="sb-bg-blob sb-bg-blob--amber" />
        <div className="sb-bg-blob sb-bg-blob--cyan" />
      </div>

      <div className="sb-page__content">
        <MarketOverview
          displayCount={displayCount}
          isLoadingCounter={isLoadingCounter}
          totalAuctions={totalAuctions}
        />

        <DashboardGrid totalAuctions={totalAuctions} />

        <ProtocolStrip />
      </div>
    </div>
  );
}

/* ───────────────────── Market Overview ───────────────────── */

function MarketOverview({ displayCount, isLoadingCounter, totalAuctions }: {
  displayCount: number; isLoadingCounter: boolean; totalAuctions: number;
}) {
  return (
    <section className="sb-overview">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sb-overview__inner"
      >
        <div className="sb-overview__copy">
          <div className="sb-overview__kicker">
            <ShieldCheck size={14} color="#f59e0b" />
            <span>Encrypted Auction Market</span>
          </div>
          <h1 className="sb-overview__title">
            ShadowBid <span className="sb-overview__title--accent">Market</span>
          </h1>
          <p className="sb-overview__sub">
            Sealed-bid auctions protected by Fully Homomorphic Encryption on Arbitrum
          </p>
          <div className="sb-overview__actions">
            <Link to="/create" className="btn-primary sb-overview__btn">
              <Plus size={18} />
              Create Auction
            </Link>
            <Link to="/auctions" className="btn-ghost sb-overview__btn">
              <Eye size={18} />
              Explore Auctions
            </Link>
          </div>
        </div>

        <div className="sb-overview__metrics">
          <MetricChip
            icon={<Radio size={14} color="#10b981" />}
            label="Live"
            value={isLoadingCounter ? '...' : displayCount.toString()}
            color="#10b981"
          />
          <MetricChip
            icon={<Users size={14} color="#06b6d4" />}
            label="Total Bids"
            value={isLoadingCounter ? '...' : totalAuctions.toString()}
            color="#06b6d4"
          />
          <MetricChip
            icon={<Lock size={14} color="#8b5cf6" />}
            label="Encrypted"
            value="Active"
            color="#8b5cf6"
          />
          <MetricChip
            icon={<Zap size={14} color="#f59e0b" />}
            label="Network"
            value="Arbitrum"
            color="#f59e0b"
          />
        </div>
      </motion.div>
    </section>
  );
}

function MetricChip({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) {
  return (
    <div className="sb-metric-chip" style={{ borderColor: `${color}25` }}>
      <div className="sb-metric-chip__icon" style={{ background: `${color}12` }}>
        {icon}
      </div>
      <div className="sb-metric-chip__text">
        <span className="sb-metric-chip__label">{label}</span>
        <span className="sb-metric-chip__value">{value}</span>
      </div>
    </div>
  );
}

/* ───────────────────── Dashboard Grid ───────────────────── */

function DashboardGrid({ totalAuctions }: { totalAuctions: number }) {
  return (
    <section className="sb-dashboard">
      <div className="sb-dashboard__grid">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="sb-dashboard__main"
        >
          <div className="sb-panel">
            <div className="sb-panel__header">
              <h2 className="sb-panel__title">
                <Radio size={16} color="#10b981" />
                Live Auctions
              </h2>
              {totalAuctions > 4 && (
                <Link to="/auctions" className="sb-panel__link">
                  View all <ChevronRight size={14} />
                </Link>
              )}
            </div>
            <div className="sb-panel__body">
              {totalAuctions === 0 ? (
                <DashboardEmptyState />
              ) : (
                <div className="sb-dashboard-auctions">
                  {Array.from({ length: Math.min(totalAuctions, 4) }, (_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.06 }}
                    >
                      <DashboardAuctionRow auctionId={i} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="sb-dashboard__side"
        >
          <div className="sb-panel">
            <div className="sb-panel__header">
              <h2 className="sb-panel__title">
                <Activity size={16} color="#06b6d4" />
                Auction Activity
              </h2>
            </div>
            <div className="sb-panel__body">
              <ActivityFeed totalAuctions={totalAuctions} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────── Auction Row (dashboard) ───────────────────── */

function DashboardAuctionRow({ auctionId }: { auctionId: number }) {
  const [now, setNow] = useState(() => BigInt(Math.floor(Date.now() / 1000)));

  useEffect(() => {
    const interval = window.setInterval(() => setNow(BigInt(Math.floor(Date.now() / 1000))), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const { data: auction, isLoading } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'auctions',
    args: [BigInt(auctionId)],
  });

  const { data: bidCount } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'getBidderCount',
    args: [BigInt(auctionId)],
  });

  if (isLoading || !auction) {
    return (
      <div className="sb-dash-row sb-dash-row--loading">
        <div className="sb-dash-row__skel-icon" />
        <div className="sb-dash-row__skel-group">
          <div className="sb-dash-row__skel-line sb-dash-row__skel-line--title" />
          <div className="sb-dash-row__skel-line sb-dash-row__skel-line--meta" />
        </div>
      </div>
    );
  }

  const auctionData: AuctionWithId = {
    id: auctionId,
    seller: (auction as unknown[])[0] as string,
    title: (auction as unknown[])[1] as string,
    biddingEnd: (auction as unknown[])[2] as bigint,
    finalized: (auction as unknown[])[3] as boolean,
    paymentClaimed: (auction as unknown[])[4] as boolean,
    minimumBid: (auction as unknown[])[5] as `0x${string}`,
    highestBid: (auction as unknown[])[6] as `0x${string}`,
    highestBidder: (auction as unknown[])[7] as `0x${string}`,
    revealedBid: (auction as unknown[])[8] as bigint,
    revealedWinner: (auction as unknown[])[9] as string,
  };

  const isActive = auctionData.biddingEnd > now && !auctionData.finalized;
  const isEnded = auctionData.finalized || auctionData.biddingEnd <= now;
  const bidderCount = Number(bidCount || 0);

  return (
    <Link to={`/auction/${auctionId}`} className="sb-dash-row">
      <div className={`sb-dash-row__icon ${isActive ? 'sb-dash-row__icon--active' : ''}`}>
        {isActive ? <Zap size={18} color="#f59e0b" /> : <Lock size={18} color="#475569" />}
      </div>
      <div className="sb-dash-row__info">
        <div className="sb-dash-row__top">
          <h4 className="sb-dash-row__title">{auctionData.title}</h4>
          {isActive && <span className="sb-badge sb-badge--active">Active</span>}
          {isEnded && !auctionData.finalized && <span className="sb-badge sb-badge--ended-warn">Ended</span>}
          {auctionData.finalized && <span className="sb-badge sb-badge--finalized">Finalized</span>}
        </div>
        <div className="sb-dash-row__meta">
          <span><Users size={12} /> {bidderCount} bidders</span>
          <span><Clock size={12} /> {isActive ? <CountdownTimer endTime={auctionData.biddingEnd} compact /> : 'Ended'}</span>
          <span className="sb-dash-row__addr">{auctionData.seller.slice(0, 6)}...{auctionData.seller.slice(-4)}</span>
        </div>
      </div>
      <ChevronRight size={16} className="sb-dash-row__chevron" />
    </Link>
  );
}

/* ───────────────────── Activity Feed ───────────────────── */

function ActivityFeed({ totalAuctions }: { totalAuctions: number }) {
  if (totalAuctions === 0) {
    return (
      <div className="sb-activity-empty">
        <Activity size={20} color="#334155" />
        <p>No recent activity</p>
      </div>
    );
  }

  // Show recent auction entries as activity items
  const recentIds = Array.from({ length: Math.min(totalAuctions, 6) }, (_, i) => totalAuctions - 1 - i);

  return (
    <div className="sb-activity-feed">
      {recentIds.map((id, i) => (
        <ActivityItem key={id} auctionId={id} index={i} />
      ))}
    </div>
  );
}

function ActivityItem({ auctionId, index }: { auctionId: number; index: number }) {
  const [now, setNow] = useState(() => BigInt(Math.floor(Date.now() / 1000)));

  useEffect(() => {
    const interval = window.setInterval(() => setNow(BigInt(Math.floor(Date.now() / 1000))), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const { data: auction, isLoading } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'auctions',
    args: [BigInt(auctionId)],
  });

  if (isLoading || !auction) return null;

  const auctionData = {
    title: (auction as unknown[])[1] as string,
    biddingEnd: (auction as unknown[])[2] as bigint,
    finalized: (auction as unknown[])[3] as boolean,
  };

  const isActive = auctionData.biddingEnd > now && !auctionData.finalized;
  const isEnded = auctionData.finalized || auctionData.biddingEnd <= now;

  const getIcon = () => {
    if (auctionData.finalized) return <Trophy size={14} color="#8b5cf6" />;
    if (isEnded) return <Lock size={14} color="#f59e0b" />;
    return <Zap size={14} color="#10b981" />;
  };

  const getAction = () => {
    if (auctionData.finalized) return 'Winner revealed';
    if (isEnded) return 'Auction ended';
    return 'New encrypted bid';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
    >
      <Link to={`/auction/${auctionId}`} className="sb-activity-item">
        <div className="sb-activity-item__icon">
          {getIcon()}
        </div>
        <div className="sb-activity-item__content">
          <span className="sb-activity-item__action">{getAction()}</span>
          <span className="sb-activity-item__title">Auction #{auctionId} &middot; {auctionData.title}</span>
        </div>
        <span className="sb-activity-item__time">
          {isActive ? <CountdownTimer endTime={auctionData.biddingEnd} compact /> : ''}
        </span>
      </Link>
    </motion.div>
  );
}

/* ───────────────────── Empty State ───────────────────── */

function DashboardEmptyState() {
  return (
    <div className="sb-dash-empty">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="sb-dash-empty__icon"
      >
        <Radio size={28} color="#f59e0b" />
      </motion.div>
      <h3 className="sb-dash-empty__title">No live auctions yet</h3>
      <p className="sb-dash-empty__desc">
        Be the first to create a sealed-bid auction on ShadowBid
      </p>
      <div className="sb-dash-empty__actions">
        <Link to="/create" className="btn-primary sb-dash-empty__btn">
          <Plus size={16} />
          Create Auction
        </Link>
        <Link to="/demo" className="btn-ghost sb-dash-empty__btn">
          <Zap size={16} />
          Try Demo
        </Link>
      </div>
    </div>
  );
}

/* ───────────────────── Protocol Strip ───────────────────── */

function ProtocolStrip() {
  return (
    <section className="sb-protocol">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="sb-protocol__inner"
      >
        <h2 className="sb-protocol__title">How ShadowBid Works</h2>
        <div className="sb-protocol__steps">
          <div className="sb-protocol__step">
            <div className="sb-protocol__step-num" style={{ color: '#f59e0b' }}>01</div>
            <div className="sb-protocol__step-icon" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)' }}>
              <Lock size={18} color="#f59e0b" />
            </div>
            <div className="sb-protocol__step-text">
              <h4>Encrypt Bid</h4>
              <p>Your bid is encrypted with FHE before leaving your browser</p>
            </div>
          </div>
          <div className="sb-protocol__arrow">&rarr;</div>
          <div className="sb-protocol__step">
            <div className="sb-protocol__step-num" style={{ color: '#06b6d4' }}>02</div>
            <div className="sb-protocol__step-icon" style={{ background: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.2)' }}>
              <Activity size={18} color="#06b6d4" />
            </div>
            <div className="sb-protocol__step-text">
              <h4>Submit On-Chain</h4>
              <p>Encrypted bids stored on-chain with ETH escrow</p>
            </div>
          </div>
          <div className="sb-protocol__arrow">&rarr;</div>
          <div className="sb-protocol__step">
            <div className="sb-protocol__step-num" style={{ color: '#8b5cf6' }}>03</div>
            <div className="sb-protocol__step-icon" style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.2)' }}>
              <Trophy size={18} color="#8b5cf6" />
            </div>
            <div className="sb-protocol__step-text">
              <h4>Reveal Winner</h4>
              <p>All bids decrypt simultaneously. Highest bidder wins</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
