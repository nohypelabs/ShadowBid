import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Gift, Diamond, Clock, AlertCircle } from 'lucide-react';
import { SHADOWBID_ADDRESS, SHADOWBID_ABI } from '../constants/contracts';

type DemoEncryptionInput = {
  items: Array<{
    value: bigint;
    type: 'uint64';
    label: string;
  }>;
};

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

  const encryptInputsAsync = async (input: DemoEncryptionInput) => {
    void input;
    return [{
      ctHash: '0x' + '0'.repeat(64),
      securityZone: 0,
      utype: 4,
      signature: '0x' + '0'.repeat(128) as `0x${string}`,
    }];
  };

  const { data: hash, writeContract, isPending: isTxPending, error: txError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const isLoading = isCreating || isTxPending || isConfirming;

  const createDemoAuctions = async () => {
    if (!address) { setError('Please connect your wallet first'); return; }
    setIsCreating(true);
    setError(null);

    try {
      for (const demo of DEMO_TEMPLATES) {
        const encryptedResults = await encryptInputsAsync({
          items: [{ value: BigInt(Math.round(demo.minBid * 1e18)), type: 'uint64', label: `minBid_${demo.title}` }],
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

  useEffect(() => {
    if (hash) toast.loading('Creating demo auctions...', { id: hash });
  }, [hash]);

  useEffect(() => {
    if (isConfirmed && hash) {
      toast.success('Demo auctions created successfully!', { id: hash });
      window.setTimeout(() => setIsCreating(false), 1000);
    }
  }, [isConfirmed, hash]);

  useEffect(() => {
    if (txError) toast.error(txError.message || 'Failed to create demo auctions');
  }, [txError]);

  const handleUseTemplate = (template: typeof DEMO_TEMPLATES[0]) => {
    navigate('/create', { state: { title: template.title, duration: template.durationHours.toString(), minimumBid: template.minBid.toString() } });
  };

  return (
    <div className="sb-demo-page">
      {/* Header */}
      <div className="sb-demo-header">
        <a href="/" className="sb-demo-back">← Back to Home</a>

        <div className="sb-demo-badge">Demo Mode</div>

        <h1 className="sb-demo-title">
          <span>Try </span>
          <span className="sb-demo-title--gradient">ShadowBid</span>
        </h1>

        <p className="sb-demo-subtitle">
          Experience FHE auctions before deploying yours.<br />
          Test bidding, finalization, and the full encryption flow.
        </p>

        <button onClick={createDemoAuctions} disabled={isLoading} className="sb-demo-cta">
          {isLoading ? (
            <>
              <svg className="sb-demo-spin" viewBox="0 0 24 24" fill="none">
                <circle className="sb-toast__spin-bg" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="sb-toast__spin-fg" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

        {error && (
          <div className="sb-demo-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="sb-demo-divider" />
      </div>

      {/* Templates */}
      <div className="sb-demo-templates responsive-section">
        <div className="sb-demo-templates-header">
          <h2 className="sb-demo-templates-title">Quick Start Templates</h2>
          <p className="sb-demo-templates-sub">Pre-configured auctions — or create your own custom one</p>
        </div>

        <div className="sb-demo-grid">
          {DEMO_TEMPLATES.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
              className="glass-card-hover sb-template-card"
            >
              {/* Icon + Meta */}
              <div className="sb-template-card__top">
                <div className="sb-template-card__icon">{template.icon}</div>
                <div className="sb-template-card__meta">
                  <span><Clock size={12} /> {template.durationHours}h</span>
                  <span className="sb-template-card__min">Min: {template.minBid} ETH</span>
                </div>
              </div>

              {/* Text */}
              <h3 className="sb-template-card__title">{template.title}</h3>
              <p className="sb-template-card__desc">{template.description}</p>

              {/* Use Button */}
              <button onClick={() => handleUseTemplate(template)} className="sb-template-card__btn">
                Use Template →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
