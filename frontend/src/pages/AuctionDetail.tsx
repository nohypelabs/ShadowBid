import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useCofheClient } from '@cofhe/react';
import { Encryptable, FheTypes } from '@cofhe/sdk';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, Lock, Trophy, AlertCircle, Gift, Wallet, ArrowDownToLine, ShieldCheck, Gavel } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CountdownTimer } from '../components';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';
import type { Auction } from '../types';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const WEI_PER_ETH = 1_000_000_000_000_000_000n;

function formatEth(value: bigint) {
  const whole = value / WEI_PER_ETH;
  const fraction = value % WEI_PER_ETH;
  if (fraction === 0n) return whole.toString();
  const padded = fraction.toString().padStart(18, '0').slice(0, 4);
  return `${whole}.${padded.replace(/0+$/, '')}`;
}

function shortAddress(value: string) {
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const { address } = useAccount();
  const auctionId = id ? BigInt(id) : BigInt(0);

  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [now, setNow] = useState(() => BigInt(Math.floor(Date.now() / 1000)));

  useEffect(() => {
    const interval = setInterval(() => setNow(BigInt(Math.floor(Date.now() / 1000))), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: auction, isLoading: auctionLoading, refetch } = useReadContract({
    address: SHADOWBID_ADDRESS, abi: SHADOWBID_ABI, functionName: 'auctions', args: [auctionId],
  });

  const { data: bidCount } = useReadContract({
    address: SHADOWBID_ADDRESS, abi: SHADOWBID_ABI, functionName: 'getBidderCount', args: [auctionId],
  });

  const { data: userBid } = useReadContract({
    address: SHADOWBID_ADDRESS, abi: SHADOWBID_ABI, functionName: 'bids',
    args: [auctionId, address || '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address },
  });

  const { data: userDeposit } = useReadContract({
    address: SHADOWBID_ADDRESS, abi: SHADOWBID_ABI, functionName: 'getBidderDeposit',
    args: [auctionId, address || '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address },
  });

  const { data: highestBidCtHash } = useReadContract({
    address: SHADOWBID_ADDRESS, abi: SHADOWBID_ABI, functionName: 'getHighestBidCtHash', args: [auctionId],
  });

  const { data: highestBidderCtHash } = useReadContract({
    address: SHADOWBID_ADDRESS, abi: SHADOWBID_ABI, functionName: 'getHighestBidderCtHash', args: [auctionId],
  });

  const cofheClient = useCofheClient();

  const [decryptedBid, setDecryptedBid] = useState<string | null>(null);
  const [decryptedBidder, setDecryptedBidder] = useState<string | null>(null);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const userDepositAmount = typeof userDeposit === 'bigint' ? userDeposit : 0n;

  useEffect(() => {
    async function tryDecrypt() {
      if (highestBidCtHash && address && cofheClient) {
        try {
          const r = await cofheClient.decryptForView(highestBidCtHash as `0x${string}`, FheTypes.Uint64).execute();
          setDecryptedBid(r.toString());
        } catch (err) {
          console.debug('[AuctionDetail] Unable to decrypt highest bid yet:', err);
        }
      }
      if (highestBidderCtHash && address && cofheClient) {
        try {
          const r = await cofheClient.decryptForView(highestBidderCtHash as `0x${string}`, FheTypes.Uint160).execute();
          setDecryptedBidder(r);
        } catch (err) {
          console.debug('[AuctionDetail] Unable to decrypt highest bidder yet:', err);
        }
      }
    }
    tryDecrypt();
  }, [highestBidCtHash, highestBidderCtHash, address, cofheClient]);

  const { data: hash, isPending: isTxPending, writeContract, error: txError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Derived state
  let auctionData: Auction | null = null;
  let isBiddingActive = false;
  let isSeller = false;
  let hasBid = false;
  let isWinning = false;
  let isWinner = false;
  let canClaimRefund = false;

  if (auction && Array.isArray(auction)) {
    auctionData = {
      seller: auction[0] as string, title: auction[1] as string, biddingEnd: auction[2] as bigint,
      finalized: auction[3] as boolean, paymentClaimed: auction[4] as boolean,
      minimumBid: auction[5] as `0x${string}`, highestBid: auction[6] as `0x${string}`,
      highestBidder: auction[7] as `0x${string}`, revealedBid: auction[8] as bigint,
      revealedWinner: auction[9] as string,
    };
    isBiddingActive = auctionData.biddingEnd > now && !auctionData.finalized;
    isSeller = !!address && auctionData.seller.toLowerCase() === address.toLowerCase();
    hasBid = userBid ? (userBid as { exists: boolean }).exists : false;
    isWinning = !!decryptedBidder && !!address && decryptedBidder.toLowerCase() === address.toLowerCase();
    isWinner = auctionData.revealedWinner !== ZERO_ADDRESS &&
               !!address && auctionData.revealedWinner.toLowerCase() === address.toLowerCase();
    canClaimRefund = hasBid && !isWinner && auctionData.finalized &&
                     auctionData.revealedWinner !== ZERO_ADDRESS &&
                     userDepositAmount > 0n;
  }

  const shouldTriggerConfetti =
    !!auctionData?.finalized &&
    auctionData.revealedWinner !== ZERO_ADDRESS &&
    !hasTriggeredConfetti;

  useEffect(() => {
    if (shouldTriggerConfetti) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#8b5cf6', '#10b981'] });
      window.setTimeout(() => setHasTriggeredConfetti(true), 0);
    }
  }, [shouldTriggerConfetti]);

  // Handlers
  const handlePlaceBid = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!address) { setError('Please connect your wallet'); return; }
    if (!auctionData || !isBiddingActive) { setError('Bidding is not active for this auction'); return; }
    if (hasBid) { setError('You have already placed a bid on this auction'); return; }
    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) { setError('Please enter a valid bid amount'); return; }
    if (!cofheClient) { setError('Cofhe client not initialized'); return; }
    try {
      setIsEncrypting(true);
      const encryptedResults = await cofheClient.encryptInputs([
        Encryptable.uint64(BigInt(Math.round(bidValue * 1e18))),
      ]).execute();
      setIsEncrypting(false);
      const encrypted = encryptedResults[0];
      const inEuint64 = { ctHash: encrypted.ctHash, securityZone: encrypted.securityZone, utype: encrypted.utype, signature: encrypted.signature as `0x${string}` };
      const bidWei = BigInt(Math.round(bidValue * 1e18));
      writeContract({ address: SHADOWBID_ADDRESS, abi: SHADOWBID_ABI, functionName: 'placeBid', args: [auctionId, inEuint64], value: bidWei });
    } catch (err) { setIsEncrypting(false); setError(err instanceof Error ? err.message : 'Failed to encrypt bid'); }
  }, [address, auctionData, isBiddingActive, hasBid, bidAmount, cofheClient, writeContract, auctionId]);

  const handleFinalize = useCallback(() => {
    if (!auctionData || !isSeller) return;
    writeContract({ address: SHADOWBID_ADDRESS, abi: SHADOWBID_ABI, functionName: 'finalize', args: [auctionId] });
  }, [auctionData, isSeller, writeContract, auctionId]);

  const handleReveal = useCallback(async () => {
    if (!auctionData?.finalized || auctionData.revealedWinner !== ZERO_ADDRESS) return;
    try {
      if (!cofheClient) { setError('Cofhe client not initialized'); return; }
      const bidResult = await cofheClient.decryptForView(highestBidCtHash as `0x${string}`, FheTypes.Uint64).execute();
      const winnerResult = await cofheClient.decryptForView(highestBidderCtHash as `0x${string}`, FheTypes.Uint160).execute();
      if (bidResult && winnerResult) setError('Reveal requires Threshold Network signatures. Please use the official SDK flow.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to decrypt results'); }
  }, [auctionData, cofheClient, highestBidCtHash, highestBidderCtHash]);

  const handleClaimPayment = useCallback(() => {
    if (!auctionData || !isSeller) return;
    writeContract({ address: SHADOWBID_ADDRESS, abi: SHADOWBID_ABI, functionName: 'claimPayment', args: [auctionId] });
  }, [auctionData, isSeller, writeContract, auctionId]);

  const handleClaimRefund = useCallback(() => {
    if (!canClaimRefund) return;
    writeContract({ address: SHADOWBID_ADDRESS, abi: SHADOWBID_ABI, functionName: 'claimRefund', args: [auctionId] });
  }, [canClaimRefund, writeContract, auctionId]);

  useEffect(() => {
    if (hash) toast.loading('Processing transaction...', { id: hash });
  }, [hash]);

  useEffect(() => {
    if (isConfirmed && hash) {
      toast.success('Transaction confirmed!', { id: hash });
      refetch();
    }
  }, [isConfirmed, hash, refetch]);

  useEffect(() => {
    if (txError) toast.error(txError.message || 'Transaction failed');
  }, [txError]);

  const isLoading = isEncrypting || isTxPending || isConfirming;
  const bidCountNumber = Number(bidCount || 0);
  const statusLabel = auctionData?.finalized ? 'Finalized' : isBiddingActive ? 'Live bidding' : 'Bidding ended';
  const statusClass = auctionData?.finalized ? 'sb-detail-status--finalized' : isBiddingActive ? 'sb-detail-status--active' : 'sb-detail-status--ended';

  if (auctionLoading) {
    return (
      <div className="sb-detail-loading">
        <svg className="sb-detail-spinner" viewBox="0 0 24 24" fill="none">
          <circle className="sb-toast__spin-bg" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="sb-toast__spin-fg" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p>Loading auction...</p>
      </div>
    );
  }

  if (!auctionData) {
    return (
      <div className="sb-detail-notfound">
        <header className="sb-detail-notfound-header">
          <Link to="/" className="sb-back-link"><ArrowLeft size={16} /> Back to Home</Link>
        </header>
        <main className="sb-detail-notfound-body">
          <h2>Auction not found</h2>
          <Link to="/">Return to Home</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="sb-detail">
      <header className="sb-detail-header">
        <Link to="/" className="sb-back-link"><ArrowLeft size={16} /> Back to Home</Link>
      </header>

      <main className="sb-detail-main">
        {/* Left Column */}
        <div className="sb-detail-left">
          {/* Auction Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sb-detail-info">
            <div className="sb-detail-info__header">
              <div>
                <div className="sb-detail-kicker"><ShieldCheck size={16} /> Auction #{auctionId.toString()} on Arbitrum Sepolia</div>
                <h1 className="sb-detail-info__title responsive-title">{auctionData.title}</h1>
                <div className="sb-detail-info__tag"><Lock size={16} /> Encrypted Sealed-Bid Auction</div>
              </div>
              <span className={`sb-detail-status ${statusClass}`}>{statusLabel}</span>
            </div>

            <div className="sb-detail-stats">
              <div className="stats-card">
                <div className="sb-detail-stat-label"><Clock size={16} /> Time Left</div>
                <CountdownTimer endTime={auctionData.biddingEnd} onComplete={() => refetch()} />
              </div>
              <div className="stats-card">
                <div className="sb-detail-stat-label"><Users size={16} /> Bidders</div>
                <p className="sb-detail-stat-value">{bidCountNumber}</p>
              </div>
              <div className="stats-card sb-detail-stats--wide">
                <div className="sb-detail-stat-label"><Lock size={16} /> Seller</div>
                <p className="sb-detail-stat-value sb-detail-stat-value--seller">
                  {shortAddress(auctionData.seller)}
                  {isSeller && <span className="sb-detail-you">(You)</span>}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Highest Bid */}
          {bidCountNumber > 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card sb-detail-highest">
              <h2 className="sb-detail-highest__title"><Trophy size={24} /> Current Highest Bid</h2>

              {auctionData.revealedWinner !== ZERO_ADDRESS ? (
                <div className="sb-detail-highest__revealed">
                  <div className="sb-detail-highest__amount">
                    <p className="sb-detail-highest__amount-label">Winning Bid</p>
                    <p className="sb-detail-highest__amount-value gradient-text">{formatEth(auctionData.revealedBid)} ETH</p>
                  </div>
                  <div className="sb-detail-highest__winner">
                    <div className="sb-detail-trophy-circle"><Trophy size={24} /></div>
                    <div>
                      <p className="sb-detail-highest__winner-label">Winner</p>
                      <p className="sb-detail-mono">{shortAddress(auctionData.revealedWinner)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sb-detail-highest__encrypted">
                  <div className="sb-detail-highest__amount">
                    <p className="sb-detail-highest__amount-label">Highest Bid (Encrypted)</p>
                    <p className="sb-detail-highest__amount-value gradient-text encrypted-blur">
                      {decryptedBid ? `${formatEth(BigInt(decryptedBid))} ETH` : 'Sealed ETH'}
                    </p>
                  </div>
                  {isWinning && (
                    <div className="sb-detail-winning-box">
                      <Trophy size={20} /> You are currently winning.
                    </div>
                  )}
                  {decryptedBidder && !isWinning && (
                    <div className="sb-detail-highest__bidder">
                      <div className="sb-detail-lock-circle"><Lock size={20} /></div>
                      <div>
                        <p className="sb-detail-highest__winner-label">Highest Bidder</p>
                        <p className="sb-detail-mono">{shortAddress(decryptedBidder)}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card sb-detail-empty-bids">
              <div className="sb-detail-lock-circle"><Gavel size={20} /></div>
              <div>
                <h2>No bids yet</h2>
                <p>Be the first bidder. Your amount stays sealed until the auction closes.</p>
              </div>
            </motion.div>
          )}

          {/* Info Box */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sb-detail-info-box">
            <Lock size={20} />
            <div>
              <h3>How your bid is encrypted</h3>
              <p>Your bid is encrypted using Fully Homomorphic Encryption (FHE) before it leaves your browser. This ensures that no one—including the seller or other bidders—can see your bid amount until the auction ends and the winner is revealed.</p>
            </div>
          </motion.div>
        </div>

        {/* Right Column — Action Panels */}
        <div className="sb-detail-right">
          <div className="sb-detail-actions">
            {/* Place Bid */}
            {isBiddingActive && !isSeller && !hasBid && (
              <ActionPanel title="Place Your Bid">
                <form onSubmit={handlePlaceBid} className="sb-detail-form">
                  <div className="sb-form-field">
                    <label className="sb-form-label" htmlFor="bidAmount">Bid Amount (ETH)</label>
                    <input type="number" id="bidAmount" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                      placeholder="0.5" step="0.0001" min="0.0001"
                      className="sb-input sb-input--mono" disabled={isLoading} />
                  </div>
                  <div className="sb-detail-deposit-notice">
                    <div className="sb-detail-deposit-notice__header"><Wallet size={16} /> ETH Deposit Required</div>
                    <p>You must deposit ETH equal to your bid amount. This ETH will be held in escrow until the auction ends. Losing bidders can claim a full refund.</p>
                  </div>
                  {error && <div className="sb-detail-error"><AlertCircle size={20} /><p>{error}</p></div>}
                  <button type="submit" disabled={isLoading || isEncrypting} className="btn-primary sb-detail-action-btn">
                    {isEncrypting ? 'Encrypting...' : isTxPending || isConfirming ? 'Processing...' : 'Place Bid & Deposit ETH'}
                  </button>
                  <p className="sb-detail-form-note">Your bid is encrypted before leaving your browser</p>
                </form>
              </ActionPanel>
            )}

            {/* Already Bid */}
            {hasBid && isBiddingActive && (
              <ActionPanel>
                <div className="sb-detail-already-bid">
                  <Lock size={20} />
                  <div>
                    <p>You have already placed a bid on this auction.</p>
                    {userDepositAmount > 0n && <p className="sb-detail-deposit-info">Your deposit: {formatEth(userDepositAmount)} ETH</p>}
                  </div>
                </div>
              </ActionPanel>
            )}

            {/* Finalize */}
            {isSeller && !isBiddingActive && !auctionData.finalized && Number(bidCount || 0) > 0 && (
              <ActionPanel title="Finalize Auction">
                <p className="sb-detail-action-desc">As the seller, you can finalize this auction to reveal the winner.</p>
                <button onClick={handleFinalize} disabled={isLoading} className="btn-primary sb-detail-action-btn">
                  {isTxPending || isConfirming ? 'Processing...' : 'Finalize Auction'}
                </button>
              </ActionPanel>
            )}

            {/* Reveal */}
            {auctionData.finalized && auctionData.revealedWinner === ZERO_ADDRESS && (
              <ActionPanel title="Reveal Winner">
                <p className="sb-detail-action-desc">The auction has been finalized. Reveal the winner and winning bid.</p>
                <button onClick={handleReveal} disabled={isLoading} className="btn-primary sb-detail-action-btn">Reveal Winner</button>
              </ActionPanel>
            )}

            {/* Claim Payment */}
            {isSeller && auctionData.finalized && auctionData.revealedWinner !== ZERO_ADDRESS && !auctionData.paymentClaimed && (
              <ActionPanel title={<><Wallet size={20} /> Claim Payment</>}>
                <p className="sb-detail-action-desc">The auction has ended and the winner has been revealed. You can now claim the winning bid amount.</p>
                <div className="sb-detail-green-box">Winning bid: {formatEth(auctionData.revealedBid)} ETH</div>
                <button onClick={handleClaimPayment} disabled={isLoading} className="btn-primary sb-detail-action-btn">
                  <ArrowDownToLine size={20} /> {isTxPending || isConfirming ? 'Processing...' : 'Claim Payment'}
                </button>
              </ActionPanel>
            )}

            {/* Payment Claimed */}
            {isSeller && auctionData.paymentClaimed && (
              <div className="sb-detail-success-box"><Gift size={20} /> Payment has been claimed!</div>
            )}

            {/* Winner */}
            {isWinner && auctionData.finalized && auctionData.revealedWinner !== ZERO_ADDRESS && (
              <div className="sb-detail-winner-box">
                <div className="sb-detail-winner-box__header">
                  <div className="sb-detail-trophy-circle"><Trophy size={24} /></div>
                  <div>
                    <h2>Congratulations!</h2>
                    <p>You won this auction</p>
                  </div>
                </div>
                <p>The seller will receive your bid payment. Thank you for participating!</p>
              </div>
            )}

            {/* Refund */}
            {canClaimRefund && (
              <ActionPanel title={<><ArrowDownToLine size={20} /> Claim Refund</>}>
                <p className="sb-detail-action-desc">Unfortunately, you didn't win this auction. You can claim a full refund of your deposited ETH.</p>
                <div className="sb-detail-amber-box">Your deposit: {formatEth(userDepositAmount)} ETH</div>
                <button onClick={handleClaimRefund} disabled={isLoading} className="btn-primary sb-detail-action-btn">
                  <ArrowDownToLine size={20} /> {isTxPending || isConfirming ? 'Processing...' : 'Claim Refund'}
                </button>
              </ActionPanel>
            )}

            {/* Refund Claimed */}
            {hasBid && !isWinner && auctionData.finalized && auctionData.revealedWinner !== ZERO_ADDRESS && userDepositAmount === 0n && (
              <div className="sb-detail-success-box"><Gift size={20} /> Refund has been claimed!</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ActionPanel({ title, children }: { title?: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card sb-detail-action-panel">
      {title && <h2 className="sb-detail-action-title">{title}</h2>}
      {children}
    </motion.div>
  );
}
