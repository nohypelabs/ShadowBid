import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCofheClient } from '@cofhe/react';
import { Encryptable } from '@cofhe/sdk';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';

type CreateAuctionTemplateState = {
  title?: string;
  description?: string;
  duration?: string;
  minimumBid?: string;
};

const STEP_LABELS: Record<string, string> = {
  initTfhe: 'Initializing FHE engine...',
  fetchKeys: 'Fetching encryption keys...',
  pack: 'Packing encrypted bid...',
  prove: 'Generating zero-knowledge proof...',
  verify: 'Verifying proof...',
};

const STEP_PROGRESS: Record<string, number> = {
  initTfhe: 10, fetchKeys: 30, pack: 50, prove: 75, verify: 95,
};

export function CreateAuction() {
  const navigate = useNavigate();
  const location = useLocation();
  const templateState = (location.state || {}) as CreateAuctionTemplateState;
  const [title, setTitle] = useState(templateState.title || '');
  const [description, setDescription] = useState(templateState.description || '');
  const [startingPrice, setStartingPrice] = useState(templateState.minimumBid || '');
  const [durationHours, setDurationHours] = useState(templateState.duration || '24');
  const [revealDelayHours, setRevealDelayHours] = useState('1');
  const [error, setError] = useState<string | null>(null);

  const client = useCofheClient();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptStep, setEncryptStep] = useState<string>('');

  const {
    data: hash,
    isPending: isTxPending,
    writeContract,
    error: txError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (hash) toast.loading('Creating auction...', { id: hash });
  }, [hash]);

  useEffect(() => {
    if (isConfirmed && hash) {
      toast.success('Auction created successfully!', { id: hash });
      const timer = window.setTimeout(() => navigate('/'), 2000);
      return () => window.clearTimeout(timer);
    }
  }, [hash, isConfirmed, navigate]);

  useEffect(() => {
    if (txError) {
      console.error('[CreateAuction] TX error:', txError);
      toast.error((txError as Error & { shortMessage?: string }).shortMessage || txError.message || 'Transaction failed');
    }
  }, [txError]);

  const isLoading = isEncrypting || isTxPending || isConfirming;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError('Please enter an auction title'); return; }

    const duration = parseInt(durationHours);
    if (isNaN(duration) || duration < 1 || duration > 720) { setError('Duration must be between 1 and 720 hours'); return; }

    const minBid = parseFloat(startingPrice);
    if (isNaN(minBid) || minBid <= 0) { setError('Starting price must be greater than 0 ETH'); return; }

    try {
      setIsEncrypting(true);
      setEncryptStep('initTfhe');
      const builder = client.encryptInputs([
        Encryptable.uint64(BigInt(Math.round(minBid * 1e18))),
      ]);
      builder.onStep((step, ctx) => { if (ctx?.isStart) setEncryptStep(step); });
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

  const progressPercent = isEncrypting && encryptStep
    ? STEP_PROGRESS[encryptStep] || 5
    : isTxPending ? 98 : 50;

  const loadingText = isEncrypting && encryptStep
    ? STEP_LABELS[encryptStep] || encryptStep
    : isEncrypting ? 'Encrypting...' : 'Waiting for confirmation...';

  return (
    <div className="sb-create-page">
      <header className="sb-create-header">
        <Link to="/" className="sb-create-back">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sb-create-title-block">
        <h1 className="sb-create-title">Create Sealed Auction</h1>
        <p className="sb-create-subtitle">Review the auction details, encrypt the minimum bid locally, then deploy to Arbitrum Sepolia.</p>
      </motion.div>

      <div className="sb-create-layout">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card sb-create-form-card responsive-form-card"
        >
          <form onSubmit={handleSubmit}>
            <FormField label="Title">
              <input
                type="text" id="title" value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Rare NFT Collection"
                className="sb-input" disabled={isLoading}
              />
            </FormField>

            <FormField label="Description">
              <textarea
                id="description" value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your auction item..." rows={3}
                className="sb-input sb-input--textarea" disabled={isLoading}
              />
            </FormField>

            <div className="sb-create-field-grid">
              <FormField label="Starting Price (ETH)">
                <input
                  type="number" id="startingPrice" value={startingPrice}
                  onChange={e => setStartingPrice(e.target.value)}
                  placeholder="0.1" step="0.0001" min="0.0001"
                  className="sb-input sb-input--mono" disabled={isLoading}
                />
              </FormField>

              <FormField label="Duration (hours)">
                <input
                  type="number" id="duration" value={durationHours}
                  onChange={e => setDurationHours(e.target.value)}
                  min="1" max="720" placeholder="24"
                  className="sb-input sb-input--mono" disabled={isLoading}
                />
              </FormField>
            </div>

            <FormField label="Reveal Delay (hours)">
              <input
                type="number" id="revealDelay" value={revealDelayHours}
                onChange={e => setRevealDelayHours(e.target.value)}
                min="1" max="168" placeholder="1"
                className="sb-input sb-input--mono" disabled={isLoading}
              />
            </FormField>

            {error && (
              <div className="sb-create-error">
                <Lock size={20} />
                <p>{error}</p>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="sb-create-submit">
              {isLoading ? (
                <span className="sb-create-loading">
                  <span className="sb-create-loading-text">
                    {loadingText}
                    {isEncrypting && encryptStep && <span className="encrypt-dots" />}
                  </span>
                  <span className="sb-create-progress-bar">
                    <span className="sb-create-progress-fill" style={{ width: `${progressPercent}%` }} />
                  </span>
                </span>
              ) : 'Encrypt & Deploy Auction'}
            </button>
          </form>
        </motion.div>

        <aside className="sb-create-summary" aria-label="Auction deployment summary">
          <div className="sb-create-summary__eyebrow">Deployment Preview</div>
          <h2>{title.trim() || 'Untitled sealed auction'}</h2>
          <dl>
            <div><dt>Minimum bid</dt><dd>{startingPrice || '0.1'} ETH</dd></div>
            <div><dt>Duration</dt><dd>{durationHours || '24'}h</dd></div>
            <div><dt>Network</dt><dd>Arbitrum Sepolia</dd></div>
          </dl>
          <div className="sb-create-info">
            <Lock size={20} />
            <p>Minimum bid encryption happens in-browser before the transaction is submitted.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sb-form-field">
      <label className="sb-form-label">{label}</label>
      {children}
    </div>
  );
}
