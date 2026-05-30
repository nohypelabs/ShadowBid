import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Lock, Users } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import type { AuctionWithId } from '../types';

interface AuctionCardProps {
  auction: AuctionWithId;
  bidCount: number;
  isLoading?: boolean;
}

export function AuctionCard({ auction, bidCount, isLoading = false }: AuctionCardProps) {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => BigInt(Math.floor(Date.now() / 1000)));

  useEffect(() => {
    const interval = window.setInterval(() => setNow(BigInt(Math.floor(Date.now() / 1000))), 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (isLoading) return <AuctionCardSkeleton />;

  const isEnded = auction.finalized || auction.biddingEnd < now;

  const statusBadge = auction.finalized
    ? <span className="badge badge-ended">Finalized</span>
    : isEnded
      ? <span className="badge badge-ended">Ended</span>
      : <span className="badge badge-active">Active</span>;

  return (
    <motion.div
      whileHover={{ translateY: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/auction/${auction.id}`)}
      className="glass-card-hover sb-card"
    >
      <div className="sb-card__body">
        {/* Header */}
        <div className="sb-card__header">
          <h3 className="sb-card__title">{auction.title}</h3>
          {statusBadge}
        </div>

        {/* Encrypted Bid */}
        <div className="sb-card__bid">
          <Lock className="sb-card__lock-icon" size={16} />
          {isEnded ? (
            <span className="sb-card__bid-value">0.000 ETH</span>
          ) : (
            <span className="encrypted-blur">0.000 ETH</span>
          )}
        </div>

        {/* Timer */}
        <div className={`sb-card__timer ${isEnded ? 'timer-normal' : 'timer-urgent'}`}>
          <Clock size={14} />
          <CountdownTimer endTime={auction.biddingEnd} compact isFinalized={auction.finalized} />
        </div>

        {/* Seller */}
        <div className="sb-card__seller">
          <Users size={16} />
          <span>{bidCount} bidder{bidCount === 1 ? '' : 's'}</span>
        </div>

        {/* CTA */}
        <button className="btn-primary sb-card__cta">
          {auction.finalized || isEnded ? 'View Auction' : 'Place Bid →'}
        </button>
      </div>
    </motion.div>
  );
}

export function AuctionCardSkeleton() {
  return (
    <div className="glass-card sb-card">
      <div className="sb-card__body">
        <div className="sb-skeleton sb-skeleton--row">
          <div className="sb-skeleton__bar sb-skeleton__bar--sm" />
          <div className="sb-skeleton__bar sb-skeleton__bar--xs" />
        </div>
        <div className="sb-skeleton__bar sb-skeleton__bar--lg" />
        <div className="sb-skeleton__bar sb-skeleton__bar--md" />
        <div className="sb-skeleton sb-skeleton--row">
          <div className="sb-skeleton__bar sb-skeleton__bar--icon" />
          <div className="sb-skeleton__bar sb-skeleton__bar--w24" />
        </div>
        <div className="sb-skeleton__bar sb-skeleton__bar--btn" />
      </div>
    </div>
  );
}
