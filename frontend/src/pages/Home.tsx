import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { motion } from 'framer-motion';
import { Lock, Link2, Trophy, ShieldCheck } from 'lucide-react';
import { AuctionCard, AuctionCardSkeleton } from '../components';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';
import type { AuctionWithId } from '../types';

export function Home() {

  const { data: auctionCounter } = useReadContract({
    address: SHADOWBID_ADDRESS,
    abi: SHADOWBID_ABI,
    functionName: 'auctionCounter',
  });

  const totalAuctions = auctionCounter ? Number(auctionCounter) : 0;

  return (
    <div>
      {/* Hero Section */}
      <section className="text-center" style={{ padding: '48px 0 36px', position: 'relative' }}>
        {/* Decorative glow — subtle radial behind headline */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.06) 0%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: -1,
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Pill label — placed close to headline */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase"
            style={{
              background: 'rgba(20, 184, 166, 0.08)',
              border: '1px solid rgba(20, 184, 166, 0.18)',
              color: '#2DD4BF',
              marginBottom: '12px',
              fontFamily: 'IBM Plex Mono',
              letterSpacing: '0.1em',
            }}
          >
            <ShieldCheck style={{ width: '18px', height: '18px', strokeWidth: 1.5 }} />
            Powered by FHE Encryption
          </div>

          {/* Headline */}
          <h1
            className="font-inter font-extrabold responsive-hero-title"
            style={{
              fontSize: 'clamp(40px, 5vw, 56px)',
              letterSpacing: '-0.035em',
              lineHeight: 1.08,
              color: 'var(--text-primary)',
              margin: '0 0 10px',
            }}
          >
            Bid Privately.
            <br />
            Win{' '}
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b 20%, #06b6d4 80%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Fairly.</span>
          </h1>

          {/* Subheadline */}
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '17px',
              lineHeight: 1.6,
              maxWidth: '460px',
              margin: '0 auto 16px',
            }}
          >
            Sealed-bid auctions on-chain. Your bids stay fully encrypted until the auction ends.
          </p>

          {/* CTA row */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => window.location.href = '/create'}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #06b6d4)',
                color: '#0a0a0a',
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '15px',
                padding: '14px 36px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 16px 40px -10px rgba(245,158,11,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Create Auction
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => window.location.href = '/demo'}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '15px',
                padding: '14px 36px',
                borderRadius: '14px',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Try Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '0 24px', margin: '24px auto 8px', maxWidth: '960px' }} className="responsive-section">
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          alignItems: 'stretch',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #1e1e2e',
            borderRadius: '16px',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e2e'}>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>Total Auctions</span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '40px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1 }}>{totalAuctions}</span>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #1e1e2e',
            borderRadius: '16px',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e2e'}>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>Active Now</span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '40px', fontWeight: 600, color: '#f59e0b', lineHeight: 1 }}>{totalAuctions}</span>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #1e1e2e',
            borderRadius: '16px',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e2e'}>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>Encryption</span>
            <span style={{ fontSize: '32px', fontWeight: 800, background: 'linear-gradient(135deg, #f59e0b, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>FHE-256</span>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #1e1e2e',
            borderRadius: '16px',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e2e'}>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>Network</span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '24px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1 }}>Arbitrum</span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: '#475569' }}>Sepolia</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ maxWidth: '72rem', margin: '0 auto', padding: '12px 24px 32px' }} className="responsive-section">
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '32px', textAlign: 'center', marginBottom: '6px', color: '#FFFFFF' }}>How It Works</h2>
        <p style={{ color: '#9CA3AF', textAlign: 'center', marginBottom: '28px', fontSize: '15px' }}>Three steps. Fully private. Mathematically verified.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="how-it-works-grid">
          <div style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '20px',
            padding: '32px 24px 24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              right: '12px',
              fontFamily: 'Inter',
              fontWeight: 800,
              fontSize: '96px',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #FBBF24, #14B8A6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              opacity: 0.08,
              userSelect: 'none',
              pointerEvents: 'none',
            }}>01</div>
            
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '9999px',
              background: 'rgba(20, 184, 166, 0.1)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.6)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <Lock style={{ width: '32px', height: '32px', color: '#2DD4BF', strokeWidth: 1.5 }} />
            </div>
            
            <h3 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', marginBottom: '6px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>Encrypt Bid</h3>
            <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: '1.65', margin: 0, maxWidth: '260px' }}>Your bid is encrypted with FHE before leaving your browser. No one can see the amount.</p>
          </div>

          <div style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '20px',
            padding: '32px 24px 24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              right: '12px',
              fontFamily: 'Inter',
              fontWeight: 800,
              fontSize: '96px',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #FBBF24, #14B8A6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              opacity: 0.08,
              userSelect: 'none',
              pointerEvents: 'none',
            }}>02</div>
            
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '9999px',
              background: 'rgba(20, 184, 166, 0.1)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.6)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <Link2 style={{ width: '32px', height: '32px', color: '#2DD4BF', strokeWidth: 1.5 }} />
            </div>
            
            <h3 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', marginBottom: '6px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>Submit On-Chain</h3>
            <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: '1.65', margin: 0, maxWidth: '260px' }}>Encrypted bids are stored on-chain. No front-running or bid sniping.</p>
          </div>

          <div style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '20px',
            padding: '32px 24px 24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              right: '12px',
              fontFamily: 'Inter',
              fontWeight: 800,
              fontSize: '96px',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #FBBF24, #14B8A6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              opacity: 0.08,
              userSelect: 'none',
              pointerEvents: 'none',
            }}>03</div>
            
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '9999px',
              background: 'rgba(20, 184, 166, 0.1)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.6)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <Trophy style={{ width: '32px', height: '32px', color: '#2DD4BF', strokeWidth: 1.5 }} />
            </div>
            
            <h3 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', marginBottom: '6px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>Reveal Winner</h3>
            <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: '1.65', margin: 0, maxWidth: '260px' }}>All bids decrypt simultaneously. Highest bidder wins fairly.</p>
          </div>
        </div>
      </section>

      {/* Active Auctions Section */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 32px' }} className="responsive-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#3A3A3A';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#2A2A2A';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
              margin: 0,
            }}>
              Active Auctions
            </h2>
            {totalAuctions > 0 && (
              <Link
                to="/demo"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  background: 'linear-gradient(135deg, #FBBF24 0%, #14B8A6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.textDecoration = 'underline';
                  e.currentTarget.style.textDecorationColor = '#14B8A6';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.textDecoration = 'none';
                }}
                onFocus={e => {
                  e.currentTarget.style.outline = 'none';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(20, 184, 166, 0.5)';
                }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                View all →
              </Link>
            )}
          </div>

          {/* Empty State */}
          {totalAuctions === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '168px',
            }}>
              {/* Icon */}
              <div style={{
                width: '40px',
                height: '40px',
                marginBottom: '12px',
              }}>
                <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%' }}>
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4B5563" fillOpacity="0.5"/>
                  <path d="M2 17L12 22L22 17" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#FFFFFF',
                margin: '0 0 4px',
              }}>
                No Active Auctions
              </h3>

              {/* Subtitle */}
              <p style={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#9CA3AF',
                maxWidth: '280px',
                textAlign: 'center',
                marginBottom: '18px',
              }}>
                Be the first to create an auction on ShadowBid
              </p>

              {/* CTA Button */}
              <Link
                to="/create"
                style={{
                  background: 'linear-gradient(135deg, #FBBF24 0%, #14B8A6 100%)',
                  color: '#0A0A0A',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(20, 184, 166, 0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onFocus={e => {
                  e.currentTarget.style.outline = 'none';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(20, 184, 166, 0.5), 0 0 0 4px #0A0A0A';
                }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Auction
              </Link>
            </div>
          ) : (
            /* Normal State - Auction List */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
            }}>
              {Array.from({ length: Math.min(totalAuctions, 8) }, (_, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 8px',
                    borderBottom: i < Math.min(totalAuctions, 8) - 1 ? '1px solid #374151' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <AuctionItem auctionId={i} />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}

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
    return <AuctionCardSkeleton />;
  }

  const auctionData: AuctionWithId = {
    id: auctionId,
    seller: (auction as unknown[])[0] as string,
    title: (auction as unknown[])[1] as string,
    biddingEnd: (auction as unknown[])[2] as bigint,
    finalized: (auction as unknown[])[3] as boolean,
    minimumBid: (auction as unknown[])[4] as `0x${string}`,
    highestBid: (auction as unknown[])[5] as `0x${string}`,
    highestBidder: (auction as unknown[])[6] as `0x${string}`,
    revealedBid: (auction as unknown[])[7] as bigint,
    revealedWinner: (auction as unknown[])[8] as string,
  };

  return <AuctionCard auction={auctionData} bidCount={Number(bidCount || 0)} />;
}