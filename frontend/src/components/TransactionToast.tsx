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

const TOAST_ICONS = {
  pending: (
    <svg className="sb-toast__spin" viewBox="0 0 24 24" fill="none">
      <circle className="sb-toast__spin-bg" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="sb-toast__spin-fg" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  confirmed: (
    <svg className="sb-toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  failed: (
    <svg className="sb-toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

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
    query: { enabled: !!txHash && status === 'pending' },
  });

  useEffect(() => {
    if ((status === 'confirmed' || status === 'failed') && autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [status, autoClose, autoCloseDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`sb-toast sb-toast--${status} ${isVisible ? 'sb-toast--visible' : 'sb-toast--hidden'}`}>
      <div className="sb-toast__inner">
        <div className="sb-toast__icon-wrap">{TOAST_ICONS[status]}</div>
        <div className="sb-toast__content">
          <p className="sb-toast__message">{message}</p>
          {txHash && (
            <a
              href={`https://sepolia.arbiscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sb-toast__link"
            >
              View on Arbiscan: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </a>
          )}
        </div>
        <button onClick={handleClose} className="sb-toast__close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
