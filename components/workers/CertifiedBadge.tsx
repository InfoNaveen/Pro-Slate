import { cn } from '@/lib/utils';

interface CertifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CertifiedBadge({ size = 'md', className }: CertifiedBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-4 py-1.5 gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold bg-yellow-50 text-yellow-700 border border-yellow-400 certified-glow',
        sizeClasses[size],
        className
      )}
    >
      <span>🏅</span>
      <span>ProSlate Certified</span>
    </span>
  );
}
