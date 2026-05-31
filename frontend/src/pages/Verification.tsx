import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Circle, Lock, Zap, Trophy } from 'lucide-react';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';
import { parseAuction, ZERO_ADDRESS } from '../utils/auction';
import { shortAddr } from '../utils/format';
import { useCurrentTimestamp } from '../hooks/useCurrentTimestamp';

export function Verification() {
  const now = useCurrentTimestamp();

  const { data: auctionCounter } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'auctionCounter',
  });

  const totalAuctions = auctionCounter ? Number(auctionCounter) : 0;
  const auctionIds = useMemo(
    () => Array.from({ length: totalAuctions }, (_, i) => totalAuctions - 1 - i),
    [totalAuctions],
  );

  return (
    <div className="sb-page-new">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sb-page-new__header"
      >
        <ShieldCheck size={24} className="icon-cipher" />
        <div>
          <h1 className="sb-page-new__title">Verification</h1>
          <p className="sb-page-new__sub">On-chain proof and verification feed</p>
        </div>
      </motion.div>

      {totalAuctions === 0 ? (
        <div className="sb-page-new__coming-soon">
          <p>No verification events yet</p>
        </div>
      ) : (
        <div className="sb-verification-feed">
          <div className="sb-dashboard-table-header">
            <span className="sb-dashboard-table-title">
              <ShieldCheck size={14} className="icon-cipher" /> Verification Events
            </span>
          </div>
          {auctionIds.map((id) => (
            <VerificationItem key={id} auctionId={id} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

function VerificationItem({ auctionId, now }: { auctionId: number; now: bigint }) {
  const { data: auction } = useReadContract({
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

  if (!auction) return null;

  const data = parseAuction(auction as unknown[], auctionId);
  const isActive = data.biddingEnd > now && !data.finalized;
  const isReveal = data.finalized && data.revealedWinner === ZERO_ADDRESS;
  const isSettle = data.finalized && data.revealedWinner !== ZERO_ADDRESS;
  const bidders = Number(bidCount || 0);

  return (
    <>
      {/* Auction created */}
      <div className="sb-verification-feed__item">
        <CheckCircle2 size={14} className="sb-verification-feed__icon sb-verification-feed__icon--done" />
        <span>Auction created — {data.title}</span>
        <span style={{ marginLeft: 'auto', color: 'var(--t3)', fontSize: '10px' }}>
          Seller: {shortAddr(data.seller)}
        </span>
      </div>

      {/* Bid commitments */}
      {bidders > 0 && (
        <div className="sb-verification-feed__item">
          <CheckCircle2 size={14} className="sb-verification-feed__icon sb-verification-feed__icon--done" />
          <span>{bidders} bid commitment{bidders !== 1 ? 's' : ''} recorded</span>
          <span style={{ marginLeft: 'auto', color: 'var(--t3)', fontSize: '10px' }}>
            FHE encrypted
          </span>
        </div>
      )}

      {/* Escrow locked */}
      {bidders > 0 && (
        <div className="sb-verification-feed__item">
          <CheckCircle2 size={14} className="sb-verification-feed__icon sb-verification-feed__icon--done" />
          <span>Escrow locked — {bidders} deposits secured</span>
        </div>
      )}

      {/* Finalization */}
      {data.finalized && (
        <div className="sb-verification-feed__item">
          <CheckCircle2 size={14} className="sb-verification-feed__icon sb-verification-feed__icon--done" />
          <span>Auction finalized — bids decryptable</span>
        </div>
      )}

      {/* Winner revealed */}
      {isSettle && (
        <div className="sb-verification-feed__item">
          <Trophy size={14} className="sb-verification-feed__icon" style={{ color: 'var(--gold)' }} />
          <span>Winner revealed — {shortAddr(data.revealedWinner)}</span>
          <span style={{ marginLeft: 'auto', color: 'var(--gold)', fontSize: '10px' }}>
            Winning bid: {data.revealedBid > 0n ? `${data.revealedBid.toString()} wei` : '—'}
          </span>
        </div>
      )}

      {/* Pending */}
      {isActive && (
        <div className="sb-verification-feed__item">
          <Circle size={14} className="sb-verification-feed__icon" style={{ color: 'var(--t4)' }} />
          <span style={{ color: 'var(--t3)' }}>Winner proof pending</span>
        </div>
      )}
    </>
  );
}
