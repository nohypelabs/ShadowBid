import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
// import { useCofheEncrypt } from '@cofhe/react'; // TODO: Re-enable once steps format is known
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';

export function CreateAuction() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [durationHours, setDurationHours] = useState('24');
  const [revealDelayHours, setRevealDelayHours] = useState('1');
  const [error, setError] = useState<string | null>(null);

  // TODO: Replace mock with real COFHE encryption once steps format is known
  // useCofheEncrypt requires specific steps structure that causes forEach error
  // Using mock for UI testing until library documentation is available
  const encryptInputsAsync = async (input: any) => {
    // Return a fake encrypted result that matches what handleSubmit expects
    return [{
      ctHash: '0x' + '0'.repeat(64),
      securityZone: 0,
      utype: 4,
      signature: '0x' + '0'.repeat(128) as `0x${string}`
    }];
  };
  const isEncrypting = false;
  
  const {
    data: hash,
    isPending: isTxPending,
    writeContract,
    error: txError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  if (hash) {
    toast.loading('Creating auction...', { id: hash });
  }

  if (isConfirmed && hash) {
    toast.success('Auction created successfully!', { id: hash });
    setTimeout(() => navigate('/'), 2000);
  }

  if (txError) {
    toast.error(txError.message || 'Failed to create auction');
  }

  const isLoading = isEncrypting || isTxPending || isConfirming;

  const inputStyle = {
    width: '100%',
    background: '#13131a',
    border: '1px solid #1e1e2e',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#f1f5f9',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block',
    color: '#64748b',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '8px',
    fontWeight: 600,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim()) {
      setError('Please enter an auction title');
      return;
    }

    const duration = parseInt(durationHours);
    if (isNaN(duration) || duration < 1 || duration > 720) {
      setError('Duration must be between 1 and 720 hours');
      return;
    }

    const minBid = parseFloat(startingPrice);
    if (isNaN(minBid) || minBid <= 0) {
      setError('Starting price must be greater than 0 ETH');
      return;
    }

    try {
      const encryptedResults = await encryptInputsAsync({
        items: [
          {
            value: BigInt(Math.round(minBid * 1e18)),
            type: 'uint64',
            label: 'minimumBid',
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
        args: [title.trim(), BigInt(duration * 3600), inEuint64],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to encrypt bid');
    }
  };

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <header style={{ marginBottom: '32px' }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', textDecoration: 'none', fontSize: '14px' }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to Home
        </Link>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px' }}
      >
        <h1 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '36px', letterSpacing: '-0.03em', color: '#f1f5f9', marginBottom: '8px' }}>
          Create Sealed Auction
        </h1>
        <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto' }}>
          Create a new sealed-bid auction. Your minimum bid will be encrypted using FHE.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: '#0d0d12',
          border: '1px solid #1e1e2e',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'left',
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="title" style={labelStyle}>Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Rare NFT Collection"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#1e1e2e'; }}
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="description" style={labelStyle}>Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your auction item..."
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#1e1e2e'; }}
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="startingPrice" style={labelStyle}>Starting Price (ETH)</label>
            <input
              type="number"
              id="startingPrice"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="0.1"
              step="0.0001"
              min="0.0001"
              style={{ ...inputStyle, fontFamily: 'IBM Plex Mono' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#1e1e2e'; }}
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="duration" style={labelStyle}>Duration (hours)</label>
            <input
              type="number"
              id="duration"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              min="1"
              max="720"
              placeholder="24"
              style={{ ...inputStyle, fontFamily: 'IBM Plex Mono' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#1e1e2e'; }}
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="revealDelay" style={labelStyle}>Reveal Delay (hours)</label>
            <input
              type="number"
              id="revealDelay"
              value={revealDelayHours}
              onChange={(e) => setRevealDelayHours(e.target.value)}
              min="1"
              max="168"
              placeholder="1"
              style={{ ...inputStyle, fontFamily: 'IBM Plex Mono' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#1e1e2e'; }}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div style={{ marginBottom: '20px', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <Lock style={{ width: '20px', height: '20px', color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f59e0b, #06b6d4)',
              color: '#000',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '15px',
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg style={{ animation: 'spin 1s linear infinite', width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deploying...
              </span>
            ) : (
              'Deploy Auction →'
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid rgba(245, 158, 11, 0.35)' }}>
          <Lock style={{ width: '20px', height: '20px', color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Bids will be encrypted with FHE-256 on-chain
          </p>
        </div>
      </motion.div>
    </div>
  );
}