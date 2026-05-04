'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { BadgeTier } from '@/types';

interface SkillScoreBarProps {
  score: number;
  badge: BadgeTier;
  label?: string;
  showTiers?: boolean;
}

const TIER_COLORS: Record<BadgeTier, string> = {
  Rookie: 'bg-gray-400',
  Verified: 'bg-blue-500',
  Expert: 'bg-[#E94560]',
  Master: 'bg-yellow-500',
};

export default function SkillScoreBar({ score, badge, label = 'Skill Score', showTiers = false }: SkillScoreBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-[#6B7280]">{label}</span>
        <span className="text-sm font-bold text-[#1A1A2E]">{score}/100</span>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', TIER_COLORS[badge])}
          style={{ width: `${width}%` }}
        />
      </div>
      {showTiers && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">Rookie</span>
          <span className="text-xs text-blue-400">Verified</span>
          <span className="text-xs text-[#E94560]">Expert</span>
          <span className="text-xs text-yellow-500">Master</span>
        </div>
      )}
    </div>
  );
}
