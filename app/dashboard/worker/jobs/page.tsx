import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import JobStatusBadge from '@/components/shared/JobStatusBadge';
import { formatINR, formatDate } from '@/lib/utils';
import type { Job } from '@/types';

export default async function WorkerJobsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: jobs } = await supabase
    .from('jobs').select('*').eq('worker_id', session.user.id).order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">My Jobs</h1>
      <div className="bg-white rounded-lg shadow-card border border-gray-100">
        {!jobs || jobs.length === 0 ? (
          <div className="p-12 text-center"><p className="text-[#6B7280]">No jobs assigned yet</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {jobs.map((job: Job) => (
              <Link key={job.id} href={`/dashboard/worker/jobs/${job.id}`}>
                <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[#1A1A2E]">{job.service_category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <p className="text-sm text-[#6B7280]">{job.area_sqft} sqft · {job.zone ?? 'Bengaluru'} · {formatDate(job.created_at)}</p>
                  </div>
                  <p className="font-bold text-[#1A1A2E]">{formatINR(job.final_cost ?? 0)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
