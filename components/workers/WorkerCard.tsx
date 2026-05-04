import Link from 'next/link';
import { Star, MapPin, Briefcase, Clock } from 'lucide-react';
import { formatINR, SPECIALIZATION_LABELS } from '@/lib/utils';
import BadgeChip from './BadgeChip';
import CertifiedBadge from './CertifiedBadge';
import type { WorkerWithProfile } from '@/types';

interface WorkerCardProps {
  worker: WorkerWithProfile;
  showBookButton?: boolean;
}

export default function WorkerCard({ worker, showBookButton = true }: WorkerCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1A1A2E] rounded-full flex items-center justify-center text-white font-bold text-lg">
            {worker.profiles.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-[#1A1A2E] text-sm">{worker.profiles.full_name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <BadgeChip badge={worker.badge} size="sm" />
              {worker.certified && <CertifiedBadge size="sm" />}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm font-semibold text-[#1A1A2E]">{worker.avg_rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Specializations */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {worker.specializations.slice(0, 3).map((spec) => (
          <span key={spec} className="text-xs bg-gray-50 text-[#6B7280] border border-gray-200 px-2 py-0.5 rounded-full">
            {SPECIALIZATION_LABELS[spec] ?? spec}
          </span>
        ))}
        {worker.specializations.length > 3 && (
          <span className="text-xs text-[#6B7280]">+{worker.specializations.length - 3} more</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b border-gray-50">
        <div className="text-center">
          <p className="text-sm font-bold text-[#1A1A2E]">{worker.total_jobs}</p>
          <p className="text-xs text-[#6B7280]">Jobs</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-[#1A1A2E]">{worker.completion_rate.toFixed(0)}%</p>
          <p className="text-xs text-[#6B7280]">Completion</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-[#1A1A2E]">{worker.experience_years}y</p>
          <p className="text-xs text-[#6B7280]">Experience</p>
        </div>
      </div>

      {/* Zone + Rate */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 text-[#6B7280]">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-xs">{worker.current_zone ?? 'Bengaluru'}</span>
        </div>
        {worker.daily_rate && (
          <span className="text-sm font-semibold text-[#1A1A2E]">
            {formatINR(worker.daily_rate)}<span className="text-xs text-[#6B7280] font-normal">/day</span>
          </span>
        )}
      </div>

      {/* Availability */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${worker.available ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {worker.available ? '● Available' : '○ Busy'}
        </span>
        {showBookButton && (
          <Link href={`/workers/${worker.id}`}>
            <button className="text-xs font-medium text-[#E94560] hover:underline">View Profile →</button>
          </Link>
        )}
      </div>
    </div>
  );
}
