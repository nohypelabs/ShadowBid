import { useState, useEffect } from 'react';

type AuctionStatus = 'active' | 'ending' | 'ended' | 'finalizing';

interface CountdownTimerProps {
  endTime: bigint;
  isFinalized?: boolean;
  onComplete?: () => void;
  compact?: boolean;
}

export function CountdownTimer({ endTime, isFinalized = false, onComplete, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [status, setStatus] = useState<AuctionStatus>('active');
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const end = Number(endTime);
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft('Ended');
        setStatus('ended');
        setSecondsLeft(0);
        onComplete?.();
        return;
      }

      setSecondsLeft(difference);
      
      if (totalDuration === 0) {
        setTotalDuration(difference);
      }

      if (isFinalized) {
        setStatus('finalizing');
      } else if (difference < 3600) {
        setStatus('ending');
      } else {
        setStatus('active');
      }

      const days = Math.floor(difference / 86400);
      const hours = Math.floor((difference % 86400) / 3600);
      const minutes = Math.floor((difference % 3600) / 60);
      const seconds = difference % 60;

      if (compact) {
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } else {
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime, isFinalized, onComplete, compact, totalDuration]);

  const statusConfig = {
    active: {
      color: 'var(--amber)',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
      pulse: false,
    },
    ending: {
      color: 'var(--amber)',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
      pulse: true,
    },
    ended: {
      color: 'var(--red)',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.2)',
      pulse: false,
    },
    finalizing: {
      color: 'var(--emerald)',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
      pulse: false,
    },
  };

  const config = statusConfig[status];

  const getProgress = (): number => {
    if (totalDuration === 0) return 0;
    return (secondsLeft / totalDuration) * 100;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-ibm-plex-mono text-sm" style={{ color: config.color }}>
          {timeLeft}
        </span>
        {secondsLeft > 0 && (
          <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div 
              className="h-full transition-all duration-1000"
              style={{ 
                width: `${getProgress()}%`,
                background: 'linear-gradient(135deg, var(--amber), var(--cyan))'
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {config.pulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--amber)' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--amber)' }}></span>
            </span>
          )}
          <span 
            className="font-ibm-plex-mono text-2xl font-bold"
            style={{ color: config.color }}
          >
            {timeLeft}
          </span>
        </div>
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium border"
          style={{ 
            background: config.bgColor,
            color: config.color,
            borderColor: config.borderColor
          }}
        >
          {status === 'active' ? 'Active' : status === 'ending' ? 'Ending Soon' : status === 'ended' ? 'Ended' : 'Finalized'}
        </span>
      </div>
      {secondsLeft > 0 && (
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div 
            className="h-full transition-all duration-1000"
            style={{ 
              width: `${getProgress()}%`,
              background: 'linear-gradient(135deg, var(--amber), var(--cyan))'
            }}
          />
        </div>
      )}
    </div>
  );
}