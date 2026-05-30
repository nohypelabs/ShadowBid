import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { motion } from 'framer-motion';
import {
  Lock, ShieldCheck, Trophy, Clock, Users, ArrowRight,
  Sparkles, TrendingUp, Zap, Search, Plus, Activity, ChevronRight,
} from 'lucide-react';
import { CountdownTimer } from '../components';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';
import type { AuctionWithId } from '../types';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');

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
      const duration = 1000;
      const steps = 30;
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
      {/* Background Blobs */}
      <div className="sb-bg-blobs">
        <div className="sb-bg-blob sb-bg-blob--amber" />
        <div className="sb-bg-blob sb-bg-blob--cyan" />
      </div>

      <div className="sb-page__content">
        <HeroSection />

        <StatsSection displayCount={displayCount} isLoadingCounter={isLoadingCounter} totalAuctions={totalAuctions} />

        <HowItWorksSection />

        <ActiveAuctionsSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} totalAuctions={totalAuctions} />

        <FooterCTA />
      </div>
    </div>
  );
}

/* ─────────────────────────── Sub-Components ─────────────────────────── */

function HeroSection() {
  return (
    <section className="sb-hero">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sb-hero__container"
      >
        {/* Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="sb-hero__badge"
        >
          <ShieldCheck size={16} color="#f59e0b" />
          <span className="sb-hero__badge-text">Powered by FHE Encryption</span>
          <Sparkles size={16} color="#06b6d4" />
        </motion.div>

        {/* Title */}
        <h1 className="sb-hero__title">
          Bid Privately.
          <br />
          <span className="sb-hero__title--gradient">Win Fairly.</span>
        </h1>

        {/* Subtitle */}
        <p className="sb-hero__subtitle">
          Sealed-bid auctions on Arbitrum. Your bids stay fully encrypted with{' '}
          <span className="sb-hero__subtitle--accent">Fully Homomorphic Encryption</span>{' '}
          until the auction ends. No front-running. No bid sniping.
        </p>

        {/* CTA Buttons */}
        <div className="sb-hero__actions">
          <Link to="/create" className="btn-primary sb-hero__btn sb-hero__btn--primary">
            <Plus size={20} />
            Create Auction
            <ArrowRight size={18} />
          </Link>
          <Link to="/demo" className="btn-ghost sb-hero__btn sb-hero__btn--ghost">
            <Zap size={18} />
            Try Demo
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function StatsSection({ displayCount, isLoadingCounter, totalAuctions }: {
  displayCount: number; isLoadingCounter: boolean; totalAuctions: number;
}) {
  return (
    <section className="sb-stats-section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="sb-stats-grid stats-grid"
      >
        <StatCard icon={<Activity size={20} color="#f59e0b" />} label="Total Auctions" value={isLoadingCounter ? '...' : displayCount.toString()} color="#f59e0b" />
        <StatCard icon={<TrendingUp size={20} color="#10b981" />} label="Active Now" value={totalAuctions.toString()} color="#10b981" />
        <StatCard icon={<Lock size={20} color="#06b6d4" />} label="Encryption" value="FHE-256" color="#06b6d4" isGradient />
        <StatCard icon={<Zap size={20} color="#8b5cf6" />} label="Network" value="Arbitrum" subValue="Sepolia Testnet" color="#8b5cf6" />
      </motion.div>
    </section>
  );
}

function StatCard({ icon, label, value, color, subValue, isGradient }: {
  icon: React.ReactNode; label: string; value: string; color: string; subValue?: string; isGradient?: boolean;
}) {
  return (
    <div className="glass-card-hover sb-stat-card">
      <div className="sb-stat-card__header">
        <div className="sb-stat-card__icon" style={{ background: `${color}15`, borderColor: `${color}30` }}>
          {icon}
        </div>
        <span className="sb-stat-card__label">{label}</span>
      </div>
      <div className={`sb-stat-card__value ${isGradient ? 'sb-stat-card__value--gradient' : ''}`}>
        {value}
      </div>
      {subValue && <span className="sb-stat-card__sub">{subValue}</span>}
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section className="sb-how-section">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="sb-how-header"
      >
        <h2 className="sb-section-title">How It Works</h2>
        <p className="sb-section-subtitle">Three steps. Fully private. Mathematically verified.</p>
      </motion.div>

      <div className="sb-how-grid how-it-works-grid">
        <StepCard step="01" icon={<Lock size={28} color="#f59e0b" />} title="Encrypt Bid" description="Your bid is encrypted with FHE before leaving your browser. No one can see the amount." color="#f59e0b" delay={0} />
        <StepCard step="02" icon={<Activity size={28} color="#06b6d4" />} title="Submit On-Chain" description="Encrypted bids are stored on-chain with ETH escrow. No front-running or bid sniping." color="#06b6d4" delay={0.15} />
        <StepCard step="03" icon={<Trophy size={28} color="#8b5cf6" />} title="Reveal Winner" description="All bids decrypt simultaneously. Highest bidder wins. Losers get instant refunds." color="#8b5cf6" delay={0.3} />
      </div>
    </section>
  );
}

function StepCard({ step, icon, title, description, color, delay }: {
  step: string; icon: React.ReactNode; title: string; description: string; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="glass-card-hover sb-step-card"
    >
      <div className="sb-step-card__bg-num" style={{ color }}>{step}</div>
      <div className="sb-step-card__icon" style={{ background: `${color}12`, borderColor: `${color}25` }}>
        {icon}
      </div>
      <h3 className="sb-step-card__title">{title}</h3>
      <p className="sb-step-card__desc">{description}</p>
    </motion.div>
  );
}

function ActiveAuctionsSection({ searchQuery, setSearchQuery, totalAuctions }: {
  searchQuery: string; setSearchQuery: (q: string) => void; totalAuctions: number;
}) {
  return (
    <section className="sb-auctions-section">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        {/* Header */}
        <div className="sb-auctions-header">
          <div>
            <h2 className="sb-section-title">Active Auctions</h2>
            <p className="sb-section-subtitle">Browse and bid on live sealed auctions</p>
          </div>

          <div className="sb-search">
            <Search size={16} color="#475569" />
            <input
              type="text"
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="sb-search__input"
            />
          </div>
        </div>

        {/* Auctions Container */}
        <div className="sb-auctions-list">
          {totalAuctions === 0 ? (
            <EmptyState />
          ) : (
            <div>
              {Array.from({ length: Math.min(totalAuctions, 8) }, (_, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <AuctionItem auctionId={i} />
                </motion.div>
              ))}
              {totalAuctions > 8 && (
                <div className="sb-auctions-more">
                  <Link to="/auctions" className="sb-auctions-more__link">
                    View All Auctions <ChevronRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="sb-empty">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="sb-empty__icon"
      >
        <Sparkles size={32} color="#f59e0b" />
      </motion.div>
      <h3 className="sb-empty__title">No Auctions Yet</h3>
      <p className="sb-empty__desc">Be the first to create a sealed-bid auction on ShadowBid</p>
      <Link to="/create" className="btn-primary sb-empty__btn">
        <Plus size={18} />
        Create First Auction
      </Link>
    </div>
  );
}

function AuctionItem({ auctionId }: { auctionId: number }) {
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
      <div className="sb-auction-item sb-auction-item--loading">
        <div className="sb-auction-item__skeleton sb-auction-item__skeleton--icon" />
        <div className="sb-auction-item__skeleton-group">
          <div className="sb-auction-item__skeleton sb-auction-item__skeleton--title" />
          <div className="sb-auction-item__skeleton sb-auction-item__skeleton--sub" />
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
    <Link to={`/auction/${auctionId}`} className="sb-auction-item">
      <div className="sb-auction-item__left">
        <div className={`sb-auction-item__icon ${isActive ? 'sb-auction-item__icon--active' : ''}`}>
          {isActive ? <Zap size={20} color="#f59e0b" /> : <Lock size={20} color="#475569" />}
        </div>
        <div className="sb-auction-item__info">
          <h4 className="sb-auction-item__title">{auctionData.title}</h4>
          <div className="sb-auction-item__meta">
            <span><Users size={12} /> {bidderCount} bidders</span>
            <span><Clock size={12} /> {isActive ? <CountdownTimer endTime={auctionData.biddingEnd} compact /> : 'Ended'}</span>
            <span className="sb-auction-item__seller">{auctionData.seller.slice(0, 6)}...{auctionData.seller.slice(-4)}</span>
          </div>
        </div>
      </div>
      <div className="sb-auction-item__right">
        {isActive && <span className="sb-badge sb-badge--active">Active</span>}
        {isEnded && !auctionData.finalized && <span className="sb-badge sb-badge--ended-warn">Ended</span>}
        {auctionData.finalized && <span className="sb-badge sb-badge--finalized">Finalized</span>}
        <ChevronRight size={18} color="#475569" />
      </div>
    </Link>
  );
}

function FooterCTA() {
  return (
    <section className="sb-footer-cta-section">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="sb-footer-cta"
      >
        <div className="sb-footer-cta__grid" />
        <div className="sb-footer-cta__content">
          <h3 className="sb-footer-cta__title">Ready to Bid Privately?</h3>
          <p className="sb-footer-cta__desc">Join the future of fair auctions with FHE encryption</p>
          <Link to="/create" className="btn-primary sb-footer-cta__btn">
            Get Started <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
