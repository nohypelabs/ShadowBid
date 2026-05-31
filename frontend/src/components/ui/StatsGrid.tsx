import type { ReactNode } from 'react';

interface StatsGridProps {
  children: ReactNode;
}

export function StatsGrid({ children }: StatsGridProps) {
  return (
    <div className="sb-stats-grid">
      {children}
    </div>
  );
}
