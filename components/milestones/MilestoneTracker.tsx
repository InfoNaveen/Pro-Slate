'use client';
import { Check, Clock, Upload, AlertCircle } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import type { Milestone } from '@/types';

const MILESTONE_NAMES = [
  'Mobilization & Site Prep',
  'Base Preparation',
  'Installation Complete',
  'Final Finishing & Handover',
];

interface MilestoneTrackerProps {
  milestones: Milestone[];
  totalCost: number;
}

function getStepIcon(status: Milestone['status']) {
  switch (status) {
    case 'paid':
    case 'approved': return <Check className="h-4 w-4" />;
    case 'submitted': return <Upload className="h-4 w-4" />;
    case 'rejected': return <AlertCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

function getStepColor(status: Milestone['status']) {
  switch (status) {
    case 'paid': return 'bg-[#10B981] text-white border-[#10B981]';
    case 'approved': return 'bg-[#10B981] text-white border-[#10B981]';
    case 'submitted': return 'bg-[#F59E0B] text-white border-[#F59E0B]';
    case 'rejected': return 'bg-[#EF4444] text-white border-[#EF4444]';
    default: return 'bg-white text-gray-400 border-gray-200';
  }
}

export default function MilestoneTracker({ milestones, totalCost }: MilestoneTrackerProps) {
  return (
    <div className="w-full">
      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100 z-0" />

        <div className="space-y-4">
          {milestones.map((milestone, idx) => (
            <div key={milestone.id} className="relative flex gap-4 z-10">
              {/* Step circle */}
              <div className={cn('w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white', getStepColor(milestone.status))}>
                {getStepIcon(milestone.status)}
              </div>

              {/* Content */}
              <div className="flex-1 bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#6B7280] font-medium">Stage {milestone.stage}</span>
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', {
                        'bg-green-100 text-green-700': milestone.status === 'paid' || milestone.status === 'approved',
                        'bg-yellow-100 text-yellow-700': milestone.status === 'submitted',
                        'bg-red-100 text-red-700': milestone.status === 'rejected',
                        'bg-gray-100 text-gray-500': milestone.status === 'pending',
                      })}>
                        {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-[#1A1A2E] text-sm mt-0.5">{milestone.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1A1A2E]">{formatINR(totalCost * milestone.payment_pct / 100)}</p>
                    <p className="text-xs text-[#6B7280]">{milestone.payment_pct}% of total</p>
                  </div>
                </div>

                {milestone.cv_verdict && (
                  <div className={cn('mt-2 text-xs px-2 py-1 rounded flex items-center gap-1', milestone.cv_verdict === 'PASS' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700')}>
                    <span>{milestone.cv_verdict === 'PASS' ? '✓' : '⚠'}</span>
                    CV Score: {milestone.cv_score?.toFixed(0)} — {milestone.cv_verdict}
                  </div>
                )}

                {milestone.admin_note && (
                  <p className="mt-2 text-xs text-[#6B7280] italic">Note: {milestone.admin_note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
