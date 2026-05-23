import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
// import { useCofheEncrypt } from '@cofhe/react'; // TODO: Re-enable once steps format is known
import { toast } from 'sonner';
import { Gift, Diamond, Clock } from 'lucide-react';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';

const DEMO_TEMPLATES = [
  {
    id: 'launch',
    title: 'Launch Auction',
    description: 'Celebrate the launch of ShadowBid with this special demo auction',
    durationHours: 48,
    minBid: 0.1,
    icon: <Gift className="w-8 h-8" />,
  },
  {
    id: 'nft',
    title: 'NFT Bundle',
    description: 'A curated collection of rare digital art pieces',
    durationHours: 2,
    minBid: 0.05,
    icon: <Diamond className="w-8 h-8" />,
  },
  {
    id: 'early',
    title: 'Early Bird',
    description: 'Exclusive early access auction for demo participants',
    durationHours: 24,
    minBid: 0.01,
    icon: <Clock className="w-8 h-8" />,
  },
];

export function Demo() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Replace mock with real COFHE encryption once steps format is known
  // useCofheEncrypt requires specific steps structure that causes forEach error
  // Using mock for UI testing until library documentation is available
  const encryptInputsAsync = async (input: any) => {
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
    <div style={{ minHeight: '100vh', background: '#030305' }}>

      {/* Header banner */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 0' }}>

        {/* Back link — own line */}
        <a href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748b',
          textDecoration: 'none',
          fontSize: '14px',
          fontFamily: 'IBM Plex Mono',
          marginBottom: '20px',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
          ← Back to Home
        </a>

        {/* DEMO MODE badge — own line below back link */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '999px',
            padding: '4px 14px',
            fontSize: '11px',
            color: '#f59e0b',
            fontFamily: 'IBM Plex Mono',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>⚡ Demo Mode</span>
        </div>

        {/* H1 */}
        <h1 style={{
          fontFamily: 'Syne',
          fontWeight: 800,
          fontSize: '48px',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          marginBottom: '16px',
          color: '#f1f5f9',
        }}>
          Try{' '}
          <span style={{
            background: 'linear-gradient(135deg, #f59e0b, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>ShadowBid</span>
        </h1>

        <p style={{
          color: '#64748b',
          fontSize: '16px',
          lineHeight: 1.6,
          maxWidth: '460px',
          marginBottom: '28px',
        }}>
          Experience FHE auctions before deploying yours. Test bidding, finalization, and the full encryption flow.
        </p>

        {/* Load Demo button */}
        <button
          onClick={createDemoAuctions}
          disabled={isLoading}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #06b6d4)',
            color: '#000',
            fontFamily: 'Syne',
            fontWeight: 700,
            fontSize: '15px',
            padding: '12px 28px',
            borderRadius: '12px',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '40px',
          }}>
          {isLoading ? (
            <>
              <svg style={{ animation: 'spin 1s linear infinite', width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </>
          ) : (
            '▶ Load Demo Auctions'
          )}
        </button>
        {error && (
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#ef4444' }}>{error}</p>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid #1e1e2e', marginBottom: '40px' }} />
      </div>

      {/* Quick Start Templates */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px', marginBottom: '6px' }}>Quick Start Templates</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>Or create a custom auction</p>

        {/* Templates grid — 2 columns on desktop, 1 on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }} className="grid-cols-1">
          {DEMO_TEMPLATES.map((template) => (
            <div key={template.id} style={{
              background: '#0d0d12',
              border: '1px solid #1e1e2e',
              borderRadius: '16px',
              padding: '24px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.transform = 'translateY(0)'; }}>

              {/* Icon */}
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{template.icon}</div>

              {/* Title + description */}
              <div>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '18px', marginBottom: '6px', color: '#f1f5f9' }}>{template.title}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>{template.description}</p>
              </div>

              {/* Meta row */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⏱ {template.durationHours}h
                </span>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: '#f59e0b' }}>
                  Min: {template.minBid} ETH
                </span>
              </div>

              {/* Use Template button */}
              <button
                onClick={() => useTemplate(template)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid #1e1e2e',
                  borderRadius: '10px',
                  padding: '10px',
                  color: '#94a3b8',
                  fontFamily: 'Syne',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; e.currentTarget.style.color = '#f59e0b'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#1e1e2e'; e.currentTarget.style.color = '#94a3b8'; }}>
                Use Template →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}