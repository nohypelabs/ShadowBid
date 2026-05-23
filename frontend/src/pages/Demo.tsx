import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Gift, Diamond, Clock, AlertCircle } from 'lucide-react';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';

const DEMO_TEMPLATES = [
  {
    id: 'launch',
    title: 'Launch Auction',
    description: 'Celebrate the launch of ShadowBid with this special demo auction',
    durationHours: 48,
    minBid: 0.1,
    icon: <Gift className="w-6 h-6" />,
  },
  {
    id: 'nft',
    title: 'NFT Bundle',
    description: 'A curated collection of rare digital art pieces',
    durationHours: 2,
    minBid: 0.05,
    icon: <Diamond className="w-6 h-6" />,
  },
  {
    id: 'early',
    title: 'Early Bird',
    description: 'Exclusive early access auction for demo participants',
    durationHours: 24,
    minBid: 0.01,
    icon: <Clock className="w-6 h-6" />,
  },
];

export function Demo() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const encryptInputsAsync = async (_input: any) => {
    return [{
      ctHash: '0x' + '0'.repeat(64),
      securityZone: 0,
      utype: 4,
      signature: '0x' + '0'.repeat(128) as `0x${string}`
    }];
  };
  const isEncryptingState = false;

  const {
    data: hash,
    writeContract,
    isPending: isTxPending,
    error: txError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const isLoading = isCreating || isEncryptingState || isTxPending || isConfirming;

  const createDemoAuctions = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      for (const demo of DEMO_TEMPLATES) {
        const encryptedResults = await encryptInputsAsync({
          items: [
            {
              value: BigInt(Math.round(demo.minBid * 1e18)),
              type: 'uint64',
              label: `minBid_${demo.title}`,
            },
          ],
        });

        const encrypted = encryptedResults[0];

        const inEuint64 = {
          ctHash: BigInt(encrypted.ctHash),
          securityZone: encrypted.securityZone,
          utype: encrypted.utype,
          signature: encrypted.signature as `0x${string}`,
        };

        writeContract({
          address: SHADOWBID_ADDRESS,
          abi: SHADOWBID_ABI,
          functionName: 'createAuction',
          args: [demo.title, BigInt(demo.durationHours * 3600), inEuint64],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create demo auctions');
      setIsCreating(false);
    }
  };

  if (hash) {
    toast.loading('Creating demo auctions...', { id: hash });
  }

  if (isConfirmed && hash) {
    toast.success('Demo auctions created successfully!', { id: hash });
    setTimeout(() => {
      setIsCreating(false);
    }, 1000);
  }

  if (txError) {
    toast.error(txError.message || 'Failed to create demo auctions');
  }

  const useTemplate = (template: typeof DEMO_TEMPLATES[0]) => {
    navigate('/create', {
      state: {
        title: template.title,
        duration: template.durationHours.toString(),
        minimumBid: template.minBid.toString(),
      },
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>

      {/* ── Header ── */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '56px 24px 0', textAlign: 'center' }}>

        {/* Back link — separated from main content */}
        <a href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '13px',
          fontFamily: 'IBM Plex Mono',
          marginBottom: '40px',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--amber)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          ← Back to Home
        </a>

        {/* Badge + Title cluster — tight grouping */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '999px',
            padding: '4px 14px',
            fontSize: '11px',
            color: '#f59e0b',
            fontFamily: 'IBM Plex Mono',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>Demo Mode</span>
        </div>

        <h1 style={{
          fontFamily: 'Inter',
          fontWeight: 800,
          fontSize: 'clamp(40px, 5vw, 56px)',
          lineHeight: 1.08,
          letterSpacing: '-0.035em',
          margin: '0 0 20px',
          color: 'var(--text-primary)',
        }}>
          <span>Try </span>
          <span style={{
            background: 'linear-gradient(135deg, #f59e0b 20%, #06b6d4 80%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>ShadowBid</span>
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '17px',
          lineHeight: 1.6,
          maxWidth: '460px',
          margin: '0 auto 28px',
        }}>
          Experience FHE auctions before deploying yours.
          <br />Test bidding, finalization, and the full encryption flow.
        </p>

        {/* CTA button */}
        <button
          onClick={createDemoAuctions}
          disabled={isLoading}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #06b6d4)',
            color: '#0a0a0a',
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: '15px',
            padding: '14px 36px',
            borderRadius: '14px',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
            opacity: isLoading ? 0.65 : 1,
          }}
          onMouseEnter={e => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 16px 40px -10px rgba(245,158,11,0.3)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
          {isLoading ? (
            <>
              <svg style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating demo auctions&hellip;
            </>
          ) : (
            <>
              Load Demo Auctions
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {/* Error inline */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.18)',
            borderRadius: '12px',
            padding: '12px 16px',
            margin: '16px auto 0',
            maxWidth: '440px',
            textAlign: 'left',
          }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
            <span style={{ color: '#ef4444', fontSize: '13px', lineHeight: 1.5 }}>{error}</span>
          </div>
        )}

        {/* Section divider */}
        <div style={{
          borderTop: '1px solid var(--border-default)',
          marginTop: '56px',
        }} />
      </div>

      {/* ── Templates ── */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontFamily: 'Inter',
            fontWeight: 800,
            fontSize: 'clamp(20px, 3vw, 26px)',
            letterSpacing: '-0.02em',
            marginBottom: '6px',
            color: 'var(--text-primary)',
          }}>Quick Start Templates</h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontFamily: 'IBM Plex Mono',
          }}>Pre-configured auctions — or create your own custom one</p>
        </div>

        {/* Template cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {DEMO_TEMPLATES.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border-default)',
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>

              {/* Icon + meta row */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(6,182,212,0.1))',
                  border: '1px solid rgba(245,158,11,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b',
                }}>
                  {template.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{
                    fontFamily: 'IBM Plex Mono',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}>
                    <Clock style={{ width: '12px', height: '12px' }} />
                    {template.durationHours}h
                  </span>
                  <span style={{
                    fontFamily: 'IBM Plex Mono',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#f59e0b',
                  }}>
                    Min: {template.minBid} ETH
                  </span>
                </div>
              </div>

              {/* Title + description */}
              <h3 style={{
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '18px',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}>{template.title}</h3>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '13px',
                lineHeight: 1.6,
                flex: 1,
                marginBottom: '24px',
              }}>{template.description}</p>

              {/* Use Template button */}
              <button
                onClick={() => useTemplate(template)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  padding: '11px 0',
                  color: 'var(--text-secondary)',
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(245,158,11,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
                  e.currentTarget.style.color = '#f59e0b';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}>
                Use Template →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
