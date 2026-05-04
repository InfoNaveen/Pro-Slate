'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { CVMetadata } from '@/types';

interface CVResultCardProps {
  score: number;
  verdict: 'PASS' | 'REVIEW';
  metadata: CVMetadata;
}

export default function CVResultCard({ score, verdict, metadata }: CVResultCardProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const isPassed = verdict === 'PASS';
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-[#1A1A2E] rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">CV</span>
        </div>
        <h3 className="font-semibold text-[#1A1A2E]">Computer Vision Verification</h3>
      </div>

      <div className="flex items-center gap-6">
        {/* Score gauge */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#f3f4f6" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="36" fill="none"
              stroke={isPassed ? '#10B981' : '#F59E0B'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[#1A1A2E]">{displayScore.toFixed(0)}</span>
            <span className="text-xs text-[#6B7280]">/ 100</span>
          </div>
        </div>

        <div className="flex-1">
          <div className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg ${isPassed ? 'bg-green-50' : 'bg-yellow-50'}`}>
            {isPassed ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <span className={`text-sm font-bold ${isPassed ? 'text-green-700' : 'text-yellow-700'}`}>
              {verdict} — Threshold: {metadata.threshold}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-2">Detected Objects:</p>
            <div className="flex flex-wrap gap-1.5">
              {metadata.detected_objects.map((obj) => (
                <span key={obj} className="text-xs bg-gray-50 text-[#6B7280] border border-gray-200 px-2 py-0.5 rounded-full">
                  {obj.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          {metadata.alignment_score && (
            <p className="text-xs text-[#6B7280] mt-2">Alignment Score: <span className="font-semibold text-[#1A1A2E]">{metadata.alignment_score}</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
