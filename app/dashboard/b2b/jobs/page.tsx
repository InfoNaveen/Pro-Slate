import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import JobStatusBadge from '@/components/shared/JobStatusBadge';
import { formatINR, formatDate, SURFACE_TYPE_LABELS } from '@/lib/utils';
import type { Job } from '@/types';

export default async function B2BJobsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('client_id', session.user.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">All Jobs</h1>
      <div className="bg-white rounded-lg shadow-card border border-gray-100">
        {!jobs || jobs.length === 0 ? (
          <div className="p-12 text-center"><p className="text-[#6B7280]">No jobs yet</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {jobs.map((job: Job) => (
              <div key={job.id} className="flex items-center justify-between p-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-[#1A1A2E]">{job.project_name ?? job.service_category.replace(/_/g, ' ')}</p>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <p className="text-sm text-[#6B7280]">{SURFACE_TYPE_LABELS[job.surface_type]} · {job.area_sqft} sqft · {job.zone}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{formatDate(job.created_at)}</p>
                </div>
                <p className="font-bold text-[#1A1A2E]">{formatINR(job.final_cost ?? 0)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
