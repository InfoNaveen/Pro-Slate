import { cn } from '@/lib/utils';

const SPEC_CONFIG: Record<string, { icon: string; color: string }> = {
  'Large Format Expert': { icon: '⬛', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'Epoxy Certified': { icon: '🔵', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Waterproofing Trained': { icon: '💧', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  'Marble Specialist': { icon: '💎', color: 'bg-gray-50 text-gray-700 border-gray-300' },
  'Precision Leveler': { icon: '📐', color: 'bg-green-50 text-green-700 border-green-200' },
};

interface SpecializationBadgeProps {
  name: string;
  size?: 'sm' | 'md';
}

export default function SpecializationBadge({ name, size = 'md' }: SpecializationBadgeProps) {
  const config = SPEC_CONFIG[name] ?? { icon: '🔧', color: 'bg-gray-50 text-gray-600 border-gray-200' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.color,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      )}
    >
      <span>{config.icon}</span>
      {name}
    </span>
  );
}
