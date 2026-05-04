import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import JobStatusBadge from '@/components/shared/JobStatusBadge';
import { formatINR, formatDate, SURFACE_TYPE_LABELS } from '@/lib/utils';
import type { Job } from '@/types';

export default async function AdminJobsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, profiles!jobs_client_id_fkey(full_name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">All Jobs ({jobs?.length ?? 0})</h1>
      <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Job</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Client</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Surface</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Area</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Cost</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Status</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(jobs ?? []).map((job: Job & { profiles?: { full_name: string } }) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium text-[#1A1A2E]">{job.service_category.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-[#6B7280]">{job.zone}</p>
                </td>
                <td className="p-4 text-[#6B7280]">{job.profiles?.full_name ?? '—'}</td>
                <td className="p-4 text-[#6B7280]">{SURFACE_TYPE_LABELS[job.surface_type]}</td>
                <td className="p-4 text-[#6B7280]">{job.area_sqft} sqft</td>
                <td className="p-4 font-semibold text-[#1A1A2E]">{formatINR(job.final_cost ?? 0)}</td>
                <td className="p-4"><JobStatusBadge status={job.status} /></td>
                <td className="p-4 text-[#6B7280]">{formatDate(job.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!jobs || jobs.length === 0) && (
          <div className="p-12 text-center"><p className="text-[#6B7280]">No jobs yet</p></div>
        )}
      </div>
    </div>
  );
}
