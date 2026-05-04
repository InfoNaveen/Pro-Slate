import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import JobStatusBadge from '@/components/shared/JobStatusBadge';
import { formatINR, formatDate } from '@/lib/utils';
import { ArrowLeft, Users, FileText, Download } from 'lucide-react';
import type { Job } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  terminated: 'bg-red-100 text-red-700',
};

export default async function B2BContractDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: contract } = await supabase
    .from('b2b_contracts')
    .select('*')
    .eq('id', params.id)
    .eq('client_id', session.user.id)
    .single();

  if (!contract) notFound();

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, milestones(*)')
    .eq('client_id', session.user.id)
    .eq('is_b2b', true)
    .order('created_at', { ascending: false });

  const workerIds: string[] = contract.worker_ids ?? [];
  const { data: workers } = workerIds.length > 0
    ? await supabase.from('worker_profiles').select('*, profiles!inner(full_name)').in('id', workerIds)
    : { data: [] };

  const totalSpend = jobs?.reduce((s, j) => s + (j.final_cost ?? 0), 0) ?? 0;
  const completedJobs = jobs?.filter((j) => j.status === 'completed') ?? [];
  const activeJobs = jobs?.filter((j) => ['in_progress', 'matched', 'milestone_review'].includes(j.status)) ?? [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/b2b/contracts">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1A1A2E]">{contract.title}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[contract.status]}`}>
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </span>
          </div>
          <p className="text-[#6B7280] text-sm mt-0.5">Contract #{contract.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <Link href={`/dashboard/b2b/contracts/${params.id}/report`} target="_blank">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Report</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Workers', value: workerIds.length },
          { label: 'Total Jobs', value: jobs?.length ?? 0 },
          { label: 'Active Jobs', value: activeJobs.length },
          { label: 'Total Spend', value: formatINR(totalSpend) },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg shadow-card border border-gray-100 p-4 text-center">
            <p className="text-xl font-bold text-[#1A1A2E]">{s.value}</p>
            <p className="text-xs text-[#6B7280]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Contract Info */}
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1A1A2E] mb-4">Contract Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {contract.description && (
                <div className="col-span-2">
                  <p className="text-xs text-[#6B7280]">Description</p>
                  <p className="text-[#1A1A2E]">{contract.description}</p>
                </div>
              )}
              {contract.start_date && (
                <div>
                  <p className="text-xs text-[#6B7280]">Start Date</p>
                  <p className="font-medium text-[#1A1A2E]">{formatDate(contract.start_date)}</p>
                </div>
              )}
              {contract.end_date && (
                <div>
                  <p className="text-xs text-[#6B7280]">End Date</p>
                  <p className="font-medium text-[#1A1A2E]">{formatDate(contract.end_date)}</p>
                </div>
              )}
              {contract.monthly_rate && (
                <div>
                  <p className="text-xs text-[#6B7280]">Monthly Rate</p>
                  <p className="font-bold text-[#1A1A2E]">{formatINR(contract.monthly_rate)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#6B7280]">Services</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(contract.service_categories ?? []).map((s: string) => (
                    <span key={s} className="text-xs bg-gray-100 text-[#6B7280] px-2 py-0.5 rounded-full">{s.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>
            </div>
            {contract.sla_terms && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-blue-700 mb-1">SLA Terms</p>
                <p className="text-xs text-blue-600">{contract.sla_terms}</p>
              </div>
            )}
          </div>

          {/* Jobs */}
          <div className="bg-white rounded-lg shadow-card border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-[#1A1A2E]">Jobs Under This Contract</h2>
              <Link href="/dashboard/b2b/jobs/new">
                <Button variant="accent" size="sm">+ Add Job</Button>
              </Link>
            </div>
            {!jobs || jobs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[#6B7280]">No jobs yet under this contract</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {jobs.map((job: Job) => (
                  <div key={job.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-[#1A1A2E] text-sm">{job.project_name ?? job.service_category.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-[#6B7280]">{job.area_sqft} sqft · {job.zone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#1A1A2E]">{formatINR(job.final_cost ?? 0)}</span>
                      <JobStatusBadge status={job.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Workers */}
        <div className="space-y-5">
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1A1A2E]">Assigned Workers</h2>
              <Link href="/dashboard/b2b/workers">
                <Button variant="outline" size="sm"><Users className="h-3.5 w-3.5 mr-1" />Add</Button>
              </Link>
            </div>
            {!workers || workers.length === 0 ? (
              <p className="text-sm text-[#6B7280] text-center py-4">No workers assigned yet</p>
            ) : (
              <div className="space-y-3">
                {workers.map((w: { id: string; badge: string; avg_rating: number; profiles: { full_name: string } }) => (
                  <div key={w.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1A1A2E] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {w.profiles.full_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1A1A2E]">{w.profiles.full_name}</p>
                      <p className="text-xs text-[#6B7280]">{w.badge} · {w.avg_rating.toFixed(1)}★</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {contract.status === 'draft' && (
            <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
              <h2 className="font-semibold text-[#1A1A2E] mb-3">Actions</h2>
              <Button variant="accent" className="w-full" onClick={async () => {}}>
                Submit for Approval
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
