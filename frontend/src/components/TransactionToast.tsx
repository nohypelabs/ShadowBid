import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';

type ToastStatus = 'pending' | 'confirmed' | 'failed';

interface TransactionToastProps {
  txHash?: `0x${string}`;
  status: ToastStatus;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function TransactionToast({
  txHash,
  status,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}: TransactionToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash && status === 'pending',
    },
  });

  useEffect(() => {
    if (status === 'confirmed' || status === 'failed') {
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [status, autoClose, autoCloseDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const statusConfig = {
    pending: {
      bgColor: 'bg-yellow-900/90',
      borderColor: 'border-yellow-600',
      icon: (
        <svg className="animate-spin h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ),
    },
    confirmed: {
      bgColor: 'bg-green-900/90',
      borderColor: 'border-green-600',
      icon: (
        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    failed: {
      bgColor: 'bg-red-900/90',
      borderColor: 'border-red-600',
      icon: (
        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`fixed bottom-4 right-4 ${config.bgColor} border ${config.borderColor} rounded-lg p-4 shadow-lg transition-all duration-300 z-50 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{ minWidth: '320px', maxWidth: '420px' }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{message}</p>
          {txHash && (
            <a
              href={`https://sepolia.arbiscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-accent mt-1 inline-block truncate"
            >
              View on Arbiscan: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </a>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}