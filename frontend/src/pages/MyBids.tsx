import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useReadContract, useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { FileKey, Lock, Clock, ChevronRight, ShieldCheck } from 'lucide-react';
import { CountdownTimer } from '../components';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';
import { parseAuction, ZERO_ADDRESS } from '../utils/auction';
import { useCurrentTimestamp } from '../hooks/useCurrentTimestamp';

export function MyBids() {
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
        <FileKey size={24} className="icon-gold" />
        <div>
          <h1 className="sb-page-new__title">My Bids</h1>
          <p className="sb-page-new__sub">Track your sealed bids across all auctions</p>
        </div>
      </motion.div>

      {!address ? (
        <div className="sb-page-new__coming-soon">
          <ShieldCheck size={32} className="icon-muted" />
          <p style={{ marginTop: '12px' }}>Connect your wallet to see your bids</p>
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
                <th>Status</th>
                <th>My Bid</th>
                <th>Phase</th>
                <th>Ends</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {auctionIds.map((id) => (
                <MyBidRow key={id} auctionId={id} address={address} now={now} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MyBidRow({ auctionId, address, now }: { auctionId: number; address: string; now: bigint }) {
  const { data: auction } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'auctions',
    args: [BigInt(auctionId)],
  });

  const { data: userBid } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'bids',
    args: [BigInt(auctionId), address as `0x${string}`],
  });

  const { data: userDeposit } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'getBidderDeposit',
    args: [BigInt(auctionId), address as `0x${string}`],
  });

  if (!auction) return null;

  const data = parseAuction(auction as unknown[], auctionId);
  const hasBid = userBid ? (userBid as { exists: boolean }).exists : false;

  if (!hasBid) return null;

  const phase = data.status === 'ACTIVE' ? 'Commit' : data.status === 'SETTLEMENT' ? 'Reveal' : 'Settled';
  const remaining = data.biddingEnd > now ? data.biddingEnd - now : 0n;

  return (
    <tr>
      <td>
        <Link to={`/auction/${auctionId}`} style={{ color: 'var(--t1)', textDecoration: 'none' }}>
          {data.title}
        </Link>
      </td>
      <td><span className="sb-badge sb-badge--active">Sealed</span></td>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--t3)' }}>
        Hidden (encrypted)
      </td>
      <td>
        <span className={`sb-badge ${data.status === 'ACTIVE' ? 'sb-badge--active' : data.status === 'FINALIZED' ? 'sb-badge--finalized' : 'sb-badge--ended-warn'}`}>
          {phase}
        </span>
      </td>
      <td>{remaining > 0n ? <CountdownTimer endTime={data.biddingEnd} compact /> : 'Ended'}</td>
      <td>
        <Link to={`/auction/${auctionId}`} style={{ color: 'var(--t3)' }}>
          <ChevronRight size={16} />
        </Link>
      </td>
    </tr>
  );
}
