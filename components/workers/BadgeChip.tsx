import { cn } from '@/lib/utils';
import type { BadgeTier } from '@/types';

interface BadgeChipProps {
  badge: BadgeTier;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const BADGE_CONFIG: Record<BadgeTier, { color: string; icon: string; label: string }> = {
  Rookie: { color: 'bg-gray-100 text-gray-600 border border-gray-300', icon: '🔰', label: 'Rookie' },
  Verified: { color: 'bg-blue-50 text-blue-700 border border-blue-300', icon: '✓', label: 'Verified' },
  Expert: { color: 'bg-red-50 text-[#E94560] border border-[#E94560]', icon: '⭐', label: 'Expert' },
  Master: { color: 'bg-yellow-50 text-yellow-700 border border-yellow-400', icon: '👑', label: 'Master' },
};

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export default function BadgeChip({ badge, size = 'md', showIcon = true }: BadgeChipProps) {
  const config = BADGE_CONFIG[badge];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full font-semibold', config.color, SIZE_CLASSES[size])}>
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}
