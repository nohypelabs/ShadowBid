import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Lock } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import type { AuctionWithId } from '../types';

interface AuctionCardProps {
  auction: AuctionWithId;
  bidCount: number;
  isLoading?: boolean;
}

export function AuctionCard({ auction, bidCount, isLoading = false }: AuctionCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/auction/${auction.id}`);
  };

  if (isLoading) {
    return <AuctionCardSkeleton />;
  }

  const isEnded = auction.finalized || auction.biddingEnd < BigInt(Math.floor(Date.now() / 1000));

  return (
    <motion.div
      whileHover={{ translateY: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="glass-card-hover rounded-xl overflow-hidden cursor-pointer group"
    >
      <div className="p-5">
        {/* Status Badge */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-inter font-semibold text-lg line-clamp-1" style={{ letterSpacing: '-0.03em' }}>
            {auction.title}
          </h3>
          {auction.finalized && <span className="badge badge-ended">Finalized</span>}
          {!auction.finalized && isEnded && <span className="badge badge-ended">Ended</span>}
          {!auction.finalized && !isEnded && <span className="badge badge-active">Active</span>}
        </div>

        {/* Encrypted Bid Display */}
        <div className="mb-3">
          <p className="text-sm flex items-center gap-1 font-ibm-plex-mono">
            <Lock className="w-4 h-4" style={{ color: 'var(--amber)' }} />
            {isEnded ? (
              <span style={{ color: 'var(--text-primary)' }}>0.000 ETH</span>
            ) : (
              <span className="encrypted-blur">0.000 ETH</span>
            )}
          </p>
        </div>

        {/* Time Remaining */}
        <div className={`flex items-center gap-2 text-sm ${isEnded ? 'timer-normal' : 'timer-urgent'}`}>
          <Clock size={14} />
          <CountdownTimer endTime={auction.biddingEnd} compact isFinalized={auction.finalized} />
        </div>

        {/* Seller */}
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs font-ibm-plex-mono" style={{ color: 'var(--text-muted)' }}>
            {auction.seller.slice(0, 6)}...{auction.seller.slice(-4)}
          </span>
        </div>

        {/* CTA Button */}
        <button className="btn-primary w-full mt-4 py-2 text-sm">
          {auction.finalized || isEnded ? 'View Auction' : 'Place Bid →'}
        </button>
      </div>
    </motion.div>
  );
}

export function AuctionCardSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 w-16 rounded-full" style={{ background: 'var(--bg-raised)' }} />
          <div className="h-4 w-8 rounded" style={{ background: 'var(--bg-raised)' }} />
        </div>
        <div className="h-6 rounded w-3/4 mb-2" style={{ background: 'var(--bg-raised)' }} />
        <div className="h-4 rounded w-1/2 mb-3" style={{ background: 'var(--bg-raised)' }} />
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 rounded" style={{ background: 'var(--bg-raised)' }} />
          <div className="h-4 w-24 rounded" style={{ background: 'var(--bg-raised)' }} />
        </div>
        <div className="h-10 rounded-lg" style={{ background: 'var(--bg-raised)' }} />
      </div>
    </div>
  );
}