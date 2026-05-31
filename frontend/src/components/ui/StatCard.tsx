import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  accent?: 'amber' | 'cyan' | 'green' | 'red';
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  onClick?: () => void;
  index?: number;
}

const ACCENT_COLORS = {
  amber: { color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', glow: 'rgba(245,158,11,0.18)' },
  cyan: { color: '#22d3ee', bg: 'rgba(34,211,238,0.06)', glow: 'rgba(34,211,238,0.15)' },
  green: { color: '#10b981', bg: 'rgba(16,185,129,0.06)', glow: 'rgba(16,185,129,0.12)' },
  red: { color: '#ef4444', bg: 'rgba(239,68,68,0.06)', glow: 'rgba(239,68,68,0.15)' },
};

export function StatCard({
  label,
  value,
  subtext,
  icon,
  accent = 'amber',
  trend,
  loading = false,
  onClick,
  index = 0,
}: StatCardProps) {
  const colors = ACCENT_COLORS[accent];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : 'rgba(255,255,255,0.28)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.075, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="sb-stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Accent bar */}
      <div
        className="sb-stat-card__accent"
        style={{ background: colors.color, boxShadow: `0 0 12px ${colors.glow}` }}
      />

      <div className="sb-stat-card__header">
        {/* Icon */}
        {icon && (
          <div
            className="sb-stat-card__icon"
            style={{ background: colors.bg, borderColor: `${colors.color}20` }}
          >
            {icon}
          </div>
        )}

        {/* Label */}
        <span className="sb-stat-card__label">{label}</span>
      </div>

      {/* Value */}
      {loading ? (
        <div className="sb-stat-card__skeleton-value" />
      ) : (
        <span className="sb-stat-card__value">{value}</span>
      )}

      {/* Subtext */}
      {loading ? (
        <div className="sb-stat-card__skeleton-sub" />
      ) : subtext ? (
        <span className="sb-stat-card__subtext" style={{ color: trendColor }}>
          {trend && trend !== 'neutral' && <TrendIcon size={12} />}
          {subtext}
        </span>
      ) : null}
    </motion.div>
  );
}
