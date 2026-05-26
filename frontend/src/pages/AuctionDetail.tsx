import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useCofheClient } from '@cofhe/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, Lock, Trophy, AlertCircle, Gift, Wallet, ArrowDownToLine } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CountdownTimer } from '../components';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';
import type { Auction } from '../types';

export function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const { address } = useAccount();
  const auctionId = id ? BigInt(id) : BigInt(0);

  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [now, setNow] = useState(() => BigInt(Math.floor(Date.now() / 1000)));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(BigInt(Math.floor(Date.now() / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: auction, isLoading: auctionLoading, refetch } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'auctions',
    args: [auctionId],
  });

  const { data: bidCount } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'getBidderCount',
    args: [auctionId],
  });

  const { data: userBid } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'bids',
    args: [auctionId, address || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: !!address,
    },
  });

  const { data: userDeposit } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'getBidderDeposit',
    args: [auctionId, address || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: !!address,
    },
  });

  const { data: highestBidCtHash } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'getHighestBidCtHash',
    args: [auctionId],
  });

  const { data: highestBidderCtHash } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'getHighestBidderCtHash',
    args: [auctionId],
  });

  const cofheClient = useCofheClient();

  const [decryptedBid, setDecryptedBid] = useState<string | null>(null);
  const [decryptedBidder, setDecryptedBidder] = useState<string | null>(null);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    async function tryDecrypt() {
      if (highestBidCtHash && address && cofheClient) {
        try {
          const bidResult = await cofheClient.decrypt.decryptUint64(highestBidCtHash);
          if (bidResult) {
            setDecryptedBid(bidResult.toString());
          }
        } catch {
        }
      }
      if (highestBidderCtHash && address && cofheClient) {
        try {
          const bidderResult = await cofheClient.decrypt.decryptAddress(highestBidderCtHash);
          if (bidderResult) {
            setDecryptedBidder(bidderResult);
          }
        } catch {
        }
      }
    }
    tryDecrypt();
  }, [highestBidCtHash, highestBidderCtHash, address, cofheClient]);

  const {
    data: hash,
    isPending: isTxPending,
    writeContract,
    error: txError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  let auctionData: Auction | null = null;
  let isBiddingActive = false;
  let isSeller = false;
  let hasBid = false;
  let isWinning = false;
  let isWinner = false;
  let canClaimRefund = false;

  if (auction && Array.isArray(auction)) {
    auctionData = {
      seller: auction[0] as string,
      title: auction[1] as string,
      biddingEnd: auction[2] as bigint,
      finalized: auction[3] as boolean,
      paymentClaimed: auction[4] as boolean,
      minimumBid: auction[5] as `0x${string}`,
      highestBid: auction[6] as `0x${string}`,
      highestBidder: auction[7] as `0x${string}`,
      revealedBid: auction[8] as bigint,
      revealedWinner: auction[9] as string,
    };

    isBiddingActive = auctionData.biddingEnd > now && !auctionData.finalized;
    isSeller = !!address && auctionData.seller.toLowerCase() === address.toLowerCase();
    hasBid = userBid ? (userBid as { exists: boolean }).exists : false;
    isWinning = !!decryptedBidder && !!address && decryptedBidder.toLowerCase() === address.toLowerCase();
    isWinner = auctionData.revealedWinner !== '0x0000000000000000000000000000000000000000' && 
               !!address && 
               auctionData.revealedWinner.toLowerCase() === address.toLowerCase();
    canClaimRefund = hasBid && !isWinner && auctionData.finalized && 
                     auctionData.revealedWinner !== '0x0000000000000000000000000000000000000000' &&
                     userDeposit && (userDeposit as bigint) > 0n;
  }

  useEffect(() => {
    if (auctionData && auctionData.finalized && auctionData.revealedWinner !== '0x0000000000000000000000000000000000000000' && !hasTriggeredConfetti) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#10b981'],
      });
      setHasTriggeredConfetti(true);
    }
  }, [auctionData, hasTriggeredConfetti]);

  const handlePlaceBid = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    if (!auctionData || !isBiddingActive) {
      setError('Bidding is not active for this auction');
      return;
    }

    if (hasBid) {
      setError('You have already placed a bid on this auction');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    if (!cofheClient) {
      setError('Cofhe client not initialized');
      return;
    }

    try {
      setIsEncrypting(true);
      const encrypted = await cofheClient.encrypt.encryptUint64(BigInt(Math.round(bidValue * 1e18)));
      setIsEncrypting(false);

      const inEuint64 = {
        ctHash: BigInt(encrypted.ctHash),
        securityZone: encrypted.securityZone,
        utype: encrypted.utype,
        signature: encrypted.signature as `0x${string}`,
      };

      const bidWei = BigInt(Math.round(bidValue * 1e18));

      writeContract({
        address: SHADOWBID_ADDRESS,
        abi: SHADOWBID_ABI,
        functionName: 'placeBid',
        args: [auctionId, inEuint64, bidWei],
        value: bidWei,
      });
    } catch (err) {
      setIsEncrypting(false);
      setError(err instanceof Error ? err.message : 'Failed to encrypt bid');
    }
  }, [address, auctionData, isBiddingActive, hasBid, bidAmount, cofheClient, writeContract, auctionId]);

  const handleFinalize = useCallback(() => {
    if (!auctionData || !isSeller) return;

    writeContract({
      address: SHADOWBID_ADDRESS,
      abi: SHADOWBID_ABI,
      functionName: 'finalize',
      args: [auctionId],
    });
  }, [auctionData, isSeller, writeContract, auctionId]);

  const handleReveal = useCallback(async () => {
    if (!auctionData || !auctionData.finalized || auctionData.revealedWinner !== '0x0000000000000000000000000000000000000000') {
      return;
    }

    try {
      if (!cofheClient) {
        setError('Cofhe client not initialized');
        return;
      }

      const bidDecryptResult = await cofheClient.decrypt.decryptUint64(highestBidCtHash!);
      const winnerDecryptResult = await cofheClient.decrypt.decryptAddress(highestBidderCtHash!);

      if (bidDecryptResult && winnerDecryptResult) {
        setError('Reveal requires Threshold Network signatures. Please use the official SDK flow.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decrypt results');
    }
  }, [auctionData, cofheClient, highestBidCtHash, highestBidderCtHash]);

  const handleClaimPayment = useCallback(() => {
    if (!auctionData || !isSeller) return;

    writeContract({
      address: SHADOWBID_ADDRESS,
      abi: SHADOWBID_ABI,
      functionName: 'claimPayment',
      args: [auctionId],
    });
  }, [auctionData, isSeller, writeContract, auctionId]);

  const handleClaimRefund = useCallback(() => {
    if (!canClaimRefund) return;

    writeContract({
      address: SHADOWBID_ADDRESS,
      abi: SHADOWBID_ABI,
      functionName: 'claimRefund',
      args: [auctionId],
    });
  }, [canClaimRefund, writeContract, auctionId]);

  if (hash) {
    toast.loading('Processing transaction...', { id: hash });
  }

  if (isConfirmed && hash) {
    toast.success('Transaction confirmed!', { id: hash });
    refetch();
  }

  if (txError) {
    toast.error(txError.message || 'Transaction failed');
  }

  const isLoading = isEncrypting || isTxPending || isConfirming;

  if (auctionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: 'var(--amber)' }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p style={{ color: 'var(--text-secondary)' }}>Loading auction...</p>
        </div>
      </div>
    );
  }

  if (!auctionData) {
    return (
      <div className="min-h-screen">
        <header
          className="sticky top-0 z-40"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="max-w-[1200px] mx-auto px-4 py-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: 'var(--amber)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-inter font-extrabold mb-4" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Auction not found
          </h2>
          <Link
            to="/"
            className="transition-colors"
            style={{ color: 'var(--amber)' }}
          >
            Return to Home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--amber)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      <main>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1
                    className="font-inter font-extrabold mb-2 responsive-title"
                    style={{ fontSize: '36px', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}
                  >
                    {auctionData.title}
                  </h1>
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">Encrypted Sealed-Bid Auction</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium">
                  {auctionData.finalized && <span className="badge badge-ended">Finalized</span>}
                  {!auctionData.finalized && isBiddingActive && <span className="badge badge-active">Active</span>}
                  {!auctionData.finalized && !isBiddingActive && <span className="badge badge-ended">Ended</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="stats-card">
                  <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Time Left</span>
                  </div>
                  <CountdownTimer endTime={auctionData.biddingEnd} onComplete={() => refetch()} />
                </div>
                <div className="stats-card">
                  <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Bidders</span>
                  </div>
                  <p className="text-2xl font-inter font-extrabold font-ibm-plex-mono" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                    {Number(bidCount || 0)}
                  </p>
                </div>
                <div className="stats-card col-span-2">
                  <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
                    <Lock className="w-4 h-4" />
                    <span className="text-xs">Seller</span>
                  </div>
                  <p className="text-lg font-ibm-plex-mono" style={{ color: 'var(--text-primary)' }}>
                    {auctionData.seller.slice(0, 8)}...{auctionData.seller.slice(-6)}
                    {isSeller && <span className="ml-2 text-xs" style={{ color: 'var(--amber)' }}>(You)</span>}
                  </p>
                </div>
              </div>
            </motion.div>

            {Number(bidCount || 0) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-xl p-8"
              >
                <h2 className="text-2xl font-inter font-extrabold mb-6 flex items-center gap-2" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                  <Trophy className="w-6 h-6" style={{ color: 'var(--amber)' }} />
                  Current Highest Bid
                </h2>

                {auctionData.revealedWinner !== '0x0000000000000000000000000000000000000000' ? (
                  <div className="space-y-4">
                    <div className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Winning Bid</p>
                      <p className="text-4xl font-inter font-extrabold font-ibm-plex-mono gradient-text" style={{ letterSpacing: '-0.03em' }}>
                        {Number(auctionData.revealedBid) / 1e18} ETH
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-cyan-600 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Winner</p>
                        <p className="font-ibm-plex-mono" style={{ color: 'var(--text-primary)' }}>
                          {auctionData.revealedWinner.slice(0, 8)}...{auctionData.revealedWinner.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Highest Bid (Encrypted)</p>
                      <p className="text-4xl font-inter font-extrabold font-ibm-plex-mono gradient-text encrypted-blur" style={{ letterSpacing: '-0.03em' }}>
                        {decryptedBid ? `${(BigInt(decryptedBid) / BigInt(1e18)).toString()} ETH` : '••••• ETH'}
                      </p>
                    </div>
                    {isWinning && (
                      <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <Trophy className="w-5 h-5" style={{ color: 'var(--emerald)' }} />
                        <p className="font-medium" style={{ color: 'var(--emerald)' }}>🎉 You are currently winning!</p>
                      </div>
                    )}
                    {decryptedBidder && !isWinning && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <Lock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Highest Bidder</p>
                          <p className="font-ibm-plex-mono" style={{ color: 'var(--text-primary)' }}>
                            {decryptedBidder.slice(0, 8)}...{decryptedBidder.slice(-6)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl p-6"
              style={{ borderLeft: '3px solid var(--border-glow)', background: 'rgba(245, 158, 11, 0.05)' }}
            >
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--amber)' }} />
                <div>
                  <h3 className="font-semibold mb-1 font-inter" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                    How your bid is encrypted
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Your bid is encrypted using Fully Homomorphic Encryption (FHE) before it leaves your browser. This ensures that no one—including the seller or other bidders—can see your bid amount until the auction ends and the winner is revealed.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              {isBiddingActive && !isSeller && !hasBid && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card rounded-xl p-6"
                >
                  <h2 className="text-xl font-inter font-extrabold mb-6" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                    Place Your Bid
                  </h2>
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div>
                      <label htmlFor="bidAmount" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Bid Amount (ETH)
                      </label>
                      <input
                        type="number"
                        id="bidAmount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="0.5"
                        step="0.0001"
                        min="0.0001"
                        className="w-full rounded-xl px-4 py-3 font-ibm-plex-mono placeholder-gray-500 transition-all"
                        style={{
                          background: 'var(--bg-raised)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.outline = '1px solid var(--amber)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.outline = 'none';
                        }}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="rounded-xl p-4" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4" style={{ color: 'var(--amber)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--amber)' }}>ETH Deposit Required</p>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        You must deposit ETH equal to your bid amount. This ETH will be held in escrow until the auction ends. Losing bidders can claim a full refund.
                      </p>
                    </div>

                    {error && (
                      <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--red)' }} />
                        <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || isEncrypting}
                      className="btn-primary w-full py-4 rounded-xl font-medium"
                    >
                      {isEncrypting ? 'Encrypting...' : isTxPending || isConfirming ? 'Processing...' : 'Place Bid & Deposit ETH'}
                    </button>

                    <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                      Your bid is encrypted before leaving your browser
                    </p>
                  </form>
                </motion.div>
              )}

              {hasBid && isBiddingActive && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card rounded-xl p-6"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5" style={{ color: 'var(--amber)' }} />
                    <div>
                      <p style={{ color: 'var(--text-primary)' }}>You have already placed a bid on this auction.</p>
                      {userDeposit && (userDeposit as bigint) > 0n && (
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          Your deposit: {Number((userDeposit as bigint) / BigInt(1e18))} ETH
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {isSeller && !isBiddingActive && !auctionData.finalized && Number(bidCount || 0) > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card rounded-xl p-6"
                >
                  <h2 className="text-xl font-inter font-extrabold mb-4" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                    Finalize Auction
                  </h2>
                  <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    As the seller, you can finalize this auction to reveal the winner.
                  </p>
                  <button
                    onClick={handleFinalize}
                    disabled={isLoading}
                    className="btn-primary w-full py-4 rounded-xl font-medium"
                  >
                    {isTxPending || isConfirming ? 'Processing...' : 'Finalize Auction'}
                  </button>
                </motion.div>
              )}

              {auctionData.finalized && auctionData.revealedWinner === '0x0000000000000000000000000000000000000000' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card rounded-xl p-6"
                >
                  <h2 className="text-xl font-inter font-extrabold mb-4" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                    Reveal Winner
                  </h2>
                  <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    The auction has been finalized. Reveal the winner and winning bid.
                  </p>
                  <button
                    onClick={handleReveal}
                    disabled={isLoading}
                    className="btn-primary w-full py-4 rounded-xl font-medium"
                  >
                    Reveal Winner
                  </button>
                </motion.div>
              )}

              {isSeller && auctionData.finalized && auctionData.revealedWinner !== '0x0000000000000000000000000000000000000000' && !auctionData.paymentClaimed && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card rounded-xl p-6"
                >
                  <h2 className="text-xl font-inter font-extrabold mb-4 flex items-center gap-2" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                    <Wallet className="w-5 h-5" style={{ color: 'var(--amber)' }} />
                    Claim Payment
                  </h2>
                  <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    The auction has ended and the winner has been revealed. You can now claim the winning bid amount.
                  </p>
                  <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <p className="text-sm" style={{ color: 'var(--emerald)' }}>
                      Winning bid: {Number(auctionData.revealedBid) / 1e18} ETH
                    </p>
                  </div>
                  <button
                    onClick={handleClaimPayment}
                    disabled={isLoading}
                    className="btn-primary w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <ArrowDownToLine className="w-5 h-5" />
                    {isTxPending || isConfirming ? 'Processing...' : 'Claim Payment'}
                  </button>
                </motion.div>
              )}

              {isSeller && auctionData.paymentClaimed && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl p-6"
                  style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                >
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5" style={{ color: 'var(--emerald)' }} />
                    <p className="font-medium" style={{ color: 'var(--emerald)' }}>Payment has been claimed!</p>
                  </div>
                </motion.div>
              )}

              {isWinner && auctionData.finalized && auctionData.revealedWinner !== '0x0000000000000000000000000000000000000000' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl p-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(6, 182, 212, 0.1))',
                    border: '1px solid var(--border-glow)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-cyan-600 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-inter font-extrabold" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                        Congratulations!
                      </h2>
                      <p className="text-sm" style={{ color: 'var(--amber)' }}>You won this auction</p>
                    </div>
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    The seller will receive your bid payment. Thank you for participating!
                  </p>
                </motion.div>
              )}

              {canClaimRefund && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card rounded-xl p-6"
                >
                  <h2 className="text-xl font-inter font-extrabold mb-4 flex items-center gap-2" style={{ letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                    <ArrowDownToLine className="w-5 h-5" style={{ color: 'var(--amber)' }} />
                    Claim Refund
                  </h2>
                  <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Unfortunately, you didn't win this auction. You can claim a full refund of your deposited ETH.
                  </p>
                  <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <p className="text-sm" style={{ color: 'var(--amber)' }}>
                      Your deposit: {Number((userDeposit as bigint) / BigInt(1e18))} ETH
                    </p>
                  </div>
                  <button
                    onClick={handleClaimRefund}
                    disabled={isLoading}
                    className="btn-primary w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <ArrowDownToLine className="w-5 h-5" />
                    {isTxPending || isConfirming ? 'Processing...' : 'Claim Refund'}
                  </button>
                </motion.div>
              )}

              {hasBid && !isWinner && auctionData.finalized && auctionData.revealedWinner !== '0x0000000000000000000000000000000000000000' && userDeposit && (userDeposit as bigint) === 0n && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl p-6"
                  style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                >
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5" style={{ color: 'var(--emerald)' }} />
                    <p className="font-medium" style={{ color: 'var(--emerald)' }}>Refund has been claimed!</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
