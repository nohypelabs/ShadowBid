import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useReadContract, useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Eye, Lock, Clock, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';
import { parseAuction, ZERO_ADDRESS } from '../utils/auction';
import { shortAddr } from '../utils/format';
import { useCurrentTimestamp } from '../hooks/useCurrentTimestamp';

export function RevealCenter() {
  const { address } = useAccount();
  const now = useCurrentTimestamp();

  const { data: auctionCounter } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'auctionCounter',
  });

  const totalAuctions = auctionCounter ? Number(auctionCounter) : 0;
  const auctionIds = useMemo(
    () => Array.from({ length: totalAuctions }, (_, i) => i),
    [totalAuctions],
  );

  return (
    <div className="sb-page-new">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sb-page-new__header"
      >
        <Eye size={24} className="icon-gold" />
        <div>
          <h1 className="sb-page-new__title">Reveal Center</h1>
          <p className="sb-page-new__sub">Auctions awaiting bid reveals — decrypt and prove your bid</p>
        </div>
      </motion.div>

      {!address ? (
        <div className="sb-page-new__coming-soon">
          <ShieldCheck size={32} className="icon-muted" />
          <p style={{ marginTop: '12px' }}>Connect your wallet to check reveal status</p>
        </div>
      ) : totalAuctions === 0 ? (
        <div className="sb-page-new__coming-soon">
          <p>No auctions yet</p>
        </div>
      ) : (
        <div className="sb-dashboard-table-card">
          <table className="sb-dashboard-table">
            <thead>
              <tr>
                <th>Auction</th>
                <th>Phase</th>
                <th>Bidders</th>
                <th>Winner</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {auctionIds.map((id) => (
                <RevealRow key={id} auctionId={id} now={now} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RevealRow({ auctionId, now }: { auctionId: number; now: bigint }) {
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

  if (!auction) return (
    <tr className="sb-table-row--loading">
      <td><span>&nbsp;</span></td>
      <td><span>&nbsp;</span></td>
      <td><span>&nbsp;</span></td>
      <td><span>&nbsp;</span></td>
      <td><span>&nbsp;</span></td>
    </tr>
  );

  const data = parseAuction(auction as unknown[], auctionId);
  if (!data) return null;

  // Only show finalized auctions that need reveal or are settled
  if (data.status === 'ACTIVE') return null;

  const bidders = Number(bidCount || 0);

  return (
    <tr>
      <td>
        <Link to={`/auction/${auctionId}`} className="sb-table-link">
          {data.title}
        </Link>
      </td>
      <td>
        <span className={`sb-badge ${data.status === 'SETTLEMENT' ? 'sb-badge--ended-warn' : 'sb-badge--finalized'}`}>
          {data.status === 'SETTLEMENT' ? 'Reveal Needed' : 'Settled'}
        </span>
      </td>
      <td>{bidders}</td>
      <td className="sb-td--mono sb-td--muted">
        {data.status === 'FINALIZED' && data.revealedWinner ? shortAddr(data.revealedWinner) : '—'}
      </td>
      <td>
        <Link to={`/auction/${auctionId}`} className="sb-table-link" style={{ color: 'var(--text-muted)' }} aria-label={`View auction ${data.title}`}>
          <ChevronRight size={16} />
        </Link>
      </td>
    </tr>
  );
}

export default RevealCenter;
