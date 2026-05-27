import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  Lock, ShieldCheck, Trophy, Clock, Users, ArrowRight, 
  Sparkles, TrendingUp, Zap, Search, Plus,
  Activity, ChevronRight
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
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Animated Background Blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '10%', left: '20%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)',
          filter: 'blur(80px)', borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '15%',
          width: '350px', height: '350px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, transparent 70%)',
          filter: 'blur(80px)', borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite 2s',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <section style={{ padding: '80px 24px 48px', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: '800px', margin: '0 auto' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: '100px',
                marginBottom: '24px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(6, 182, 212, 0.12))',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              <ShieldCheck size={16} color="#f59e0b" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fbbf24', fontFamily: 'IBM Plex Mono' }}>
                Powered by FHE Encryption
              </span>
              <Sparkles size={16} color="#06b6d4" />
            </motion.div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'Inter',
              fontWeight: 800,
              fontSize: 'clamp(42px, 6vw, 68px)',
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              marginBottom: '24px',
              color: '#f1f5f9',
            }}>
              Bid Privately.
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #06b6d4 50%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Win Fairly.
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '18px',
              lineHeight: 1.7,
              color: '#94a3b8',
              maxWidth: '600px',
              margin: '0 auto 40px',
            }}>
              Sealed-bid auctions on Arbitrum. Your bids stay fully encrypted with{' '}
              <span style={{ color: '#2dd4bf', fontWeight: 600 }}>Fully Homomorphic Encryption</span>{' '}
              until the auction ends. No front-running. No bid sniping.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                to="/create"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 36px',
                  fontSize: '16px',
                  fontWeight: 700,
                  borderRadius: '14px',
                  textDecoration: 'none',
                }}
              >
                <Plus size={20} />
                Create Auction
                <ArrowRight size={18} />
              </Link>
              
              <Link
                to="/demo"
                className="btn-ghost"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 36px',
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '14px',
                  textDecoration: 'none',
                }}
              >
                <Zap size={18} />
                Try Demo
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section style={{ padding: '0 24px 48px', maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
            }}
            className="stats-grid"
          >
            <StatCard
              icon={<Activity size={20} color="#f59e0b" />}
              label="Total Auctions"
              value={isLoadingCounter ? '...' : displayCount.toString()}
              color="#f59e0b"
            />
            <StatCard
              icon={<TrendingUp size={20} color="#10b981" />}
              label="Active Now"
              value={totalAuctions.toString()}
              color="#10b981"
            />
            <StatCard
              icon={<Lock size={20} color="#06b6d4" />}
              label="Encryption"
              value="FHE-256"
              color="#06b6d4"
              isGradient
            />
            <StatCard
              icon={<Zap size={20} color="#8b5cf6" />}
              label="Network"
              value="Arbitrum"
              subValue="Sepolia Testnet"
              color="#8b5cf6"
            />
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section style={{ padding: '48px 24px 64px', maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <h2 style={{
              fontFamily: 'Inter',
              fontWeight: 800,
              fontSize: '36px',
              color: '#f1f5f9',
              letterSpacing: '-0.03em',
              marginBottom: '12px',
            }}>
              How It Works
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '17px' }}>
              Three steps. Fully private. Mathematically verified.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
          className="how-it-works-grid"
          >
            <StepCard
              step="01"
              icon={<Lock size={28} color="#f59e0b" />}
              title="Encrypt Bid"
              description="Your bid is encrypted with FHE before leaving your browser. No one can see the amount."
              color="#f59e0b"
              delay={0}
            />
            <StepCard
              step="02"
              icon={<Activity size={28} color="#06b6d4" />}
              title="Submit On-Chain"
              description="Encrypted bids are stored on-chain with ETH escrow. No front-running or bid sniping."
              color="#06b6d4"
              delay={0.15}
            />
            <StepCard
              step="03"
              icon={<Trophy size={28} color="#8b5cf6" />}
              title="Reveal Winner"
              description="All bids decrypt simultaneously. Highest bidder wins. Losers get instant refunds."
              color="#8b5cf6"
              delay={0.3}
            />
          </div>
        </section>

        {/* Active Auctions Section */}
        <section style={{ padding: '0 24px 64px', maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Section Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <div>
                <h2 style={{
                  fontFamily: 'Inter',
                  fontWeight: 800,
                  fontSize: '28px',
                  color: '#f1f5f9',
                  letterSpacing: '-0.03em',
                  marginBottom: '4px',
                }}>
                  Active Auctions
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '15px' }}>
                  Browse and bid on live sealed auctions
                </p>
              </div>
              
              {/* Search */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '12px',
                background: '#13131a',
                border: '1px solid #1e1e2e',
              }}>
                <Search size={16} color="#475569" />
                <input
                  type="text"
                  placeholder="Search auctions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    width: '200px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Auctions Container */}
            <div style={{
              background: '#0d0d12',
              border: '1px solid #1e1e2e',
              borderRadius: '20px',
              overflow: 'hidden',
            }}>
              {totalAuctions === 0 ? (
                <EmptyState />
              ) : (
                <div>
                  {Array.from({ length: Math.min(totalAuctions, 8) }, (_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <AuctionItem auctionId={i} />
                    </motion.div>
                  ))}
                  {totalAuctions > 8 && (
                    <div style={{
                      padding: '16px',
                      textAlign: 'center',
                      borderTop: '1px solid #1e1e2e',
                    }}>
                      <Link
                        to="/auctions"
                        style={{
                          color: '#f59e0b',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        View All Auctions
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Footer CTA */}
        <section style={{ padding: '0 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(6, 182, 212, 0.08))',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '24px',
              padding: '56px 40px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Grid pattern */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              opacity: 0.5,
            }} />
            
            <div style={{ position: 'relative' }}>
              <h3 style={{
                fontFamily: 'Inter',
                fontWeight: 800,
                fontSize: '32px',
                color: '#f1f5f9',
                letterSpacing: '-0.03em',
                marginBottom: '12px',
              }}>
                Ready to Bid Privately?
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '17px', marginBottom: '32px' }}>
                Join the future of fair auctions with FHE encryption
              </p>
              <Link
                to="/create"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: 700,
                  borderRadius: '14px',
                  textDecoration: 'none',
                }}
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color, subValue, isGradient }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  subValue?: string;
  isGradient?: boolean;
}) {
  return (
    <div
      className="glass-card-hover"
      style={{
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}15`,
          border: `1px solid ${color}30`,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#64748b',
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontFamily: 'IBM Plex Mono',
        fontSize: '32px',
        fontWeight: 700,
        lineHeight: 1,
        ...(isGradient ? {
          background: 'linear-gradient(135deg, #f59e0b, #06b6d4)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        } : {
          color: '#f1f5f9',
        }),
      }}>
        {value}
      </div>
      {subValue && (
        <span style={{ fontSize: '12px', color: '#64748b' }}>{subValue}</span>
      )}
    </div>
  );
}

// Step Card Component
function StepCard({ step, icon, title, description, color, delay }: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="glass-card-hover"
      style={{
        padding: '32px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Step Number Background */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        fontFamily: 'Inter',
        fontWeight: 800,
        fontSize: '64px',
        lineHeight: 1,
        color: color,
        opacity: 0.06,
        userSelect: 'none',
      }}>
        {step}
      </div>

      {/* Icon */}
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        background: `${color}12`,
        border: `1px solid ${color}25`,
      }}>
        {icon}
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: '18px',
        color: '#f1f5f9',
        marginBottom: '8px',
        letterSpacing: '-0.02em',
      }}>
        {title}
      </h3>

      {/* Description */}
      <p style={{
        color: '#94a3b8',
        fontSize: '14px',
        lineHeight: 1.6,
        margin: 0,
      }}>
        {description}
      </p>
    </motion.div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      textAlign: 'center',
    }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(6, 182, 212, 0.1))',
          border: '1px solid rgba(245, 158, 11, 0.2)',
        }}
      >
        <Sparkles size={32} color="#f59e0b" />
      </motion.div>
      
      <h3 style={{
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: '20px',
        color: '#f1f5f9',
        marginBottom: '8px',
      }}>
        No Auctions Yet
      </h3>
      <p style={{
        color: '#94a3b8',
        fontSize: '15px',
        maxWidth: '360px',
        marginBottom: '24px',
        lineHeight: 1.6,
      }}>
        Be the first to create a sealed-bid auction on ShadowBid
      </p>
      
      <Link
        to="/create"
        className="btn-primary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 700,
          borderRadius: '12px',
          textDecoration: 'none',
        }}
      >
        <Plus size={18} />
        Create First Auction
      </Link>
    </div>
  );
}

// Auction Item Component
function AuctionItem({ auctionId }: { auctionId: number }) {
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
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e1e2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#13131a',
            animation: 'pulse 2s infinite',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{
              height: '16px',
              width: '140px',
              borderRadius: '4px',
              background: '#13131a',
              marginBottom: '8px',
              animation: 'pulse 2s infinite',
            }} />
            <div style={{
              height: '12px',
              width: '200px',
              borderRadius: '4px',
              background: '#13131a',
              animation: 'pulse 2s infinite',
            }} />
          </div>
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

  const now = BigInt(Math.floor(Date.now() / 1000));
  const isActive = auctionData.biddingEnd > now && !auctionData.finalized;
  const isEnded = auctionData.finalized || auctionData.biddingEnd <= now;
  const bidderCount = Number(bidCount || 0);

  return (
    <Link
      to={`/auction/${auctionId}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid #1e1e2e',
        textDecoration: 'none',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Icon */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isActive 
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(6, 182, 212, 0.12))'
            : 'rgba(255,255,255,0.04)',
          border: isActive ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid #1e1e2e',
        }}>
          {isActive ? (
            <Zap size={20} color="#f59e0b" />
          ) : (
            <Lock size={20} color="#475569" />
          )}
        </div>

        {/* Info */}
        <div>
          <h4 style={{
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '15px',
            color: '#f1f5f9',
            marginBottom: '4px',
            letterSpacing: '-0.02em',
          }}>
            {auctionData.title}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
              <Users size={12} />
              {bidderCount} bidders
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
              <Clock size={12} />
              {isActive ? (
                <CountdownTimer endTime={auctionData.biddingEnd} compact />
              ) : (
                'Ended'
              )}
            </span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: '#475569' }}>
              {auctionData.seller.slice(0, 6)}...{auctionData.seller.slice(-4)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Status Badge */}
        {isActive && (
          <span style={{
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 600,
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}>
            Active
          </span>
        )}
        {isEnded && !auctionData.finalized && (
          <span style={{
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 600,
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}>
            Ended
          </span>
        )}
        {auctionData.finalized && (
          <span style={{
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 600,
            background: 'rgba(139, 92, 246, 0.1)',
            color: '#8b5cf6',
            border: '1px solid rgba(139, 92, 246, 0.25)',
          }}>
            Finalized
          </span>
        )}

        <ChevronRight size={18} color="#475569" />
      </div>
    </Link>
  );
}
