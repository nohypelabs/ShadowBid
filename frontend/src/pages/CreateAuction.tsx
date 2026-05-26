import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCofheClient } from '@cofhe/react';
import { Encryptable } from '@cofhe/sdk';
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

  const client = useCofheClient();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptStep, setEncryptStep] = useState<string>('');

  const STEP_LABELS: Record<string, string> = {
    initTfhe: 'Initializing FHE engine...',
    fetchKeys: 'Fetching encryption keys...',
    pack: 'Packing encrypted bid...',
    prove: 'Generating zero-knowledge proof...',
    verify: 'Verifying proof...',
  };

  const STEP_PROGRESS: Record<string, number> = {
    initTfhe: 10,
    fetchKeys: 30,
    pack: 50,
    prove: 75,
    verify: 95,
  };
  
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

  useEffect(() => {
    if (txError) {
      console.error('[CreateAuction] TX error:', {
        message: txError.message,
        name: txError.name,
        cause: txError.cause,
        details: (txError as any).details,
        metaMessages: (txError as any).metaMessages,
        shortMessage: (txError as any).shortMessage,
      });
      toast.error(txError.shortMessage || txError.message || 'Transaction failed');
    }
  }, [txError]);

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
      setIsEncrypting(true);
      setEncryptStep('initTfhe');
      const builder = client.encryptInputs([
        Encryptable.uint64(BigInt(Math.round(minBid * 1e18))),
      ]);
      builder.onStep((step, ctx) => {
        if (ctx?.isStart) {
          setEncryptStep(step);
        }
      });
      const encryptedResults = await builder.execute();
      setIsEncrypting(false);
      setEncryptStep('');

      const encrypted = encryptedResults[0];

      const inEuint64 = {
        ctHash: encrypted.ctHash,
        securityZone: encrypted.securityZone,
        utype: encrypted.utype,
        signature: encrypted.signature,
      };

      writeContract({
        address: SHADOWBID_ADDRESS,
        abi: SHADOWBID_ABI,
        functionName: 'createAuction',
        args: [title.trim(), BigInt(duration * 3600), inEuint64, BigInt(Math.round(minBid * 1e18))],
      });
    } catch (err) {
      setIsEncrypting(false);
      setEncryptStep('');
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
        className="responsive-form-card"
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
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
                {/* Step label + animated dots */}
                {isEncrypting && encryptStep ? (
                  <span style={{ fontSize: '13px', fontFamily: 'IBM Plex Mono', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {STEP_LABELS[encryptStep] || encryptStep}
                    <span className="encrypt-dots" />
                  </span>
                ) : (
                  <span style={{ fontSize: '13px', fontFamily: 'IBM Plex Mono', fontWeight: 500 }}>
                    {isEncrypting ? 'Encrypting...' : 'Waiting for confirmation...'}
                  </span>
                )}
                {/* Progress bar */}
                <span style={{
                  display: 'block',
                  width: '100%',
                  height: '4px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <span style={{
                    display: 'block',
                    height: '100%',
                    width: `${isEncrypting && encryptStep ? STEP_PROGRESS[encryptStep] || 5 : isTxPending ? 98 : 50}%`,
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '2px',
                    transition: 'width 0.5s ease',
                  }} />
                </span>
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