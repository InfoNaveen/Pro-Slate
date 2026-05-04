import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BadgeChip from '@/components/workers/BadgeChip';
import CertifiedBadge from '@/components/workers/CertifiedBadge';
import SkillScoreBar from '@/components/workers/SkillScoreBar';
import JobStatusBadge from '@/components/shared/JobStatusBadge';
import { formatINR, formatDate } from '@/lib/utils';
import { Briefcase, Star, TrendingUp, DollarSign } from 'lucide-react';
import type { Job } from '@/types';

export default async function WorkerDashboard() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
  const { data: worker } = await supabase.from('worker_profiles').select('*').eq('id', session.user.id).single();
  const { data: jobs } = await supabase.from('jobs').select('*, milestones(*)').eq('worker_id', session.user.id).order('created_at', { ascending: false }).limit(5);
  const { data: escrow } = await supabase.from('escrow_transactions').select('amount').eq('type', 'release').eq('status', 'confirmed');

  const activeJob = jobs?.find((j) => j.status === 'in_progress' || j.status === 'milestone_review');
  const totalEarned = escrow?.reduce((s, t) => s + t.amount, 0) ?? 0;

  if (!worker) {
    return (
      <div className="text-center py-20">
        <p className="text-[#6B7280]">Worker profile not set up. Please complete your profile.</p>
        <Link href="/dashboard/worker/profile" className="text-[#E94560] font-medium mt-2 block">Complete Profile →</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Welcome, {profile?.full_name?.split(' ')[0]} 👷</h1>
          <div className="flex items-center gap-2 mt-1">
            <BadgeChip badge={worker.badge} />
            {worker.certified && <CertifiedBadge />}
          </div>
        </div>
        <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${worker.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {worker.available ? '● Available' : '○ Busy'}
        </div>
      </div>

      {/* Skill scores */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SkillScoreBar score={worker.skill_score} badge={worker.badge} label="Skill Score" showTiers />
          <SkillScoreBar score={worker.reliability_score} badge={worker.badge} label="Reliability Score" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Jobs', value: worker.total_jobs, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
          { label: 'Avg Rating', value: `${worker.avg_rating.toFixed(1)}★`, icon: Star, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Completion', value: `${worker.completion_rate.toFixed(0)}%`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
          { label: 'Total Earned', value: formatINR(totalEarned), icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg shadow-card border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#1A1A2E]">{s.value}</p>
                <p className="text-xs text-[#6B7280]">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Job */}
      {activeJob && (
        <div className="bg-[#1A1A2E] rounded-lg p-5 mb-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Active Job</h2>
            <JobStatusBadge status={activeJob.status} />
          </div>
          <p className="font-bold text-lg">{activeJob.project_name ?? activeJob.service_category.replace(/_/g, ' ')}</p>
          <p className="text-gray-300 text-sm mt-1">{activeJob.area_sqft} sqft · {activeJob.zone}</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-[#E94560] font-bold text-lg">{formatINR(activeJob.final_cost ?? 0)}</span>
            <Link href={`/dashboard/worker/jobs/${activeJob.id}`}>
              <button className="bg-[#E94560] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#d63d56] transition-colors">
                View Job →
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-[#1A1A2E]">Recent Jobs</h2>
          <Link href="/dashboard/worker/jobs" className="text-sm text-[#E94560] hover:underline">View all →</Link>
        </div>
        {!jobs || jobs.length === 0 ? (
          <div className="p-8 text-center"><p className="text-sm text-[#6B7280]">No jobs assigned yet</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {jobs.map((job: Job) => (
              <Link key={job.id} href={`/dashboard/worker/jobs/${job.id}`}>
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-[#1A1A2E] text-sm">{job.service_category.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-[#6B7280]">{job.area_sqft} sqft · {formatDate(job.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#1A1A2E]">{formatINR(job.final_cost ?? 0)}</span>
                    <JobStatusBadge status={job.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
