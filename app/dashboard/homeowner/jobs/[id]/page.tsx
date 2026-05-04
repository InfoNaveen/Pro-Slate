import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MilestoneTracker from '@/components/milestones/MilestoneTracker';
import EscrowCard from '@/components/escrow/EscrowCard';
import JobStatusBadge from '@/components/shared/JobStatusBadge';
import { formatINR, formatDate, SURFACE_TYPE_LABELS } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';

export default async function HomeownerJobDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: job } = await supabase
    .from('jobs')
    .select('*, milestones(*)')
    .eq('id', params.id)
    .eq('client_id', session.user.id)
    .single();

  if (!job) notFound();

  const { data: escrow } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('job_id', params.id)
    .order('created_at', { ascending: false });

  const totalLocked = escrow?.filter((t) => t.type === 'lock').reduce((s, t) => s + t.amount, 0) ?? 0;
  const totalReleased = escrow?.filter((t) => t.type === 'release').reduce((s, t) => s + t.amount, 0) ?? 0;

  const milestones = (job.milestones ?? []).sort((a: { stage: number }, b: { stage: number }) => a.stage - b.stage);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/homeowner/jobs">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1A1A2E]">
              {job.service_category.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </h1>
            <JobStatusBadge status={job.status} />
          </div>
          <p className="text-[#6B7280] text-sm mt-0.5">Job #{job.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Job Details */}
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1A1A2E] mb-4">Job Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Surface Type', value: SURFACE_TYPE_LABELS[job.surface_type] },
                { label: 'Area', value: `${job.area_sqft} sq ft` },
                { label: 'Condition', value: job.surface_condition },
                { label: 'Complexity', value: job.complexity },
                { label: 'Floors', value: job.floor_count },
                { label: 'Created', value: formatDate(job.created_at) },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-[#6B7280]">{item.label}</p>
                  <p className="text-sm font-medium text-[#1A1A2E] capitalize">{item.value}</p>
                </div>
              ))}
            </div>
            {job.site_address && (
              <div className="mt-4 flex items-start gap-2 text-sm text-[#6B7280]">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{job.site_address}</span>
              </div>
            )}
            {job.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-[#6B7280]">Notes: {job.notes}</p>
              </div>
            )}
          </div>

          {/* Milestone Tracker */}
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1A1A2E] mb-4">Milestone Progress</h2>
            {milestones.length > 0 ? (
              <MilestoneTracker milestones={milestones} totalCost={job.final_cost ?? 0} />
            ) : (
              <p className="text-sm text-[#6B7280]">Milestones will appear once a worker is assigned.</p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Cost Summary */}
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1A1A2E] mb-4">Cost Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Estimated Cost</span>
                <span className="font-semibold text-[#1A1A2E]">{formatINR(job.estimated_cost ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Final Cost</span>
                <span className="font-bold text-[#1A1A2E]">{formatINR(job.final_cost ?? 0)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
                <span className="text-[#6B7280]">Released So Far</span>
                <span className="font-semibold text-[#10B981]">{formatINR(totalReleased)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Remaining in Escrow</span>
                <span className="font-semibold text-[#1A1A2E]">{formatINR(totalLocked - totalReleased)}</span>
              </div>
            </div>
          </div>

          {/* Escrow */}
          <EscrowCard transactions={escrow ?? []} totalLocked={totalLocked} totalReleased={totalReleased} />

          {/* Dispute */}
          {['in_progress', 'milestone_review'].includes(job.status) && (
            <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
              <h2 className="font-semibold text-[#1A1A2E] mb-2">Issues?</h2>
              <p className="text-xs text-[#6B7280] mb-3">If you have concerns about the work quality, raise a dispute.</p>
              <Link href={`/dashboard/homeowner/jobs/${job.id}`}>
                <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50">Raise Dispute</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
