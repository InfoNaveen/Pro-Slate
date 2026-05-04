import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import JobStatusBadge from '@/components/shared/JobStatusBadge';
import { formatINR, formatDate, SURFACE_TYPE_LABELS } from '@/lib/utils';
import { Plus } from 'lucide-react';
import type { Job } from '@/types';

export default async function HomeownerJobsPage() {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">My Jobs</h1>
          <p className="text-[#6B7280] text-sm">{jobs?.length ?? 0} total jobs</p>
        </div>
        <Link href="/dashboard/homeowner/jobs/new">
          <Button variant="accent"><Plus className="h-4 w-4 mr-2" />New Job</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-card border border-gray-100">
        {!jobs || jobs.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-5xl">📋</span>
            <p className="text-[#6B7280] mt-3 mb-4">No jobs yet</p>
            <Link href="/dashboard/homeowner/jobs/new"><Button variant="accent">Book Your First Job</Button></Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {jobs.map((job: Job) => (
              <Link key={job.id} href={`/dashboard/homeowner/jobs/${job.id}`}>
                <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[#1A1A2E]">{job.service_category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <p className="text-sm text-[#6B7280]">
                      {SURFACE_TYPE_LABELS[job.surface_type]} · {job.area_sqft} sqft · {job.zone ?? 'Bengaluru'}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{formatDate(job.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1A1A2E]">{formatINR(job.final_cost ?? 0)}</p>
                    <p className="text-xs text-[#6B7280]">Estimated cost</p>
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
