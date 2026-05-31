import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useReadContract, useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Banknote, ChevronRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';
import { parseAuction, ZERO_ADDRESS } from '../utils/auction';
import { formatEth, shortAddr } from '../utils/format';

export function Settlement() {
  const { address } = useAccount();

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
        <Banknote size={24} className="icon-gold" />
        <div>
          <h1 className="sb-page-new__title">Settlement</h1>
          <p className="sb-page-new__sub">Claim payments and refunds from concluded auctions</p>
        </div>
      </motion.div>

      {!address ? (
        <div className="sb-page-new__coming-soon">
          <ShieldCheck size={32} className="icon-muted" />
          <p style={{ marginTop: '12px' }}>Connect your wallet to check settlement status</p>
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
                <th>Winner</th>
                <th>Winning Bid</th>
                <th>Payment Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {auctionIds.map((id) => (
                <SettlementRow key={id} auctionId={id} address={address} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SettlementRow({ auctionId, address }: { auctionId: number; address: string }) {
  const { data: auction } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'auctions',
    args: [BigInt(auctionId)],
  });

  const { data: paymentClaimed } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'isPaymentClaimed',
    args: [BigInt(auctionId)],
  });

  if (!auction) return null;

  const data = parseAuction(auction as unknown[], auctionId);

  // Only show settled auctions
  if (data.status !== 'FINALIZED') return null;

  const isWinner = data.revealedWinner.toLowerCase() === address.toLowerCase();
  const isSeller = data.seller.toLowerCase() === address.toLowerCase();
  const claimed = paymentClaimed as boolean;

  return (
    <tr>
      <td>
        <Link to={`/auction/${auctionId}`} style={{ color: 'var(--t1)', textDecoration: 'none' }}>
          {data.title}
        </Link>
      </td>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--t2)' }}>
        {shortAddr(data.revealedWinner)}
      </td>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)' }}>
        {formatEth(data.revealedBid)} ETH
      </td>
      <td>
        {claimed ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-success)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            <CheckCircle2 size={14} /> Claimed
          </span>
        ) : isWinner || isSeller ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            <Clock size={14} /> Claimable
          </span>
        ) : (
          <span style={{ color: 'var(--t3)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>—</span>
        )}
      </td>
      <td>
        <Link to={`/auction/${auctionId}`} style={{ color: 'var(--t3)' }}>
          <ChevronRight size={16} />
        </Link>
      </td>
    </tr>
  );
}
