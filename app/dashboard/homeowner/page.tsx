import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import JobStatusBadge from '@/components/shared/JobStatusBadge';
import { formatINR, formatDate } from '@/lib/utils';
import { Plus, Briefcase, Clock, CheckCircle } from 'lucide-react';
import type { Job } from '@/types';

export default async function HomeownerDashboard() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
  const { data: jobs } = await supabase.from('jobs').select('*').eq('client_id', session.user.id).order('created_at', { ascending: false }).limit(5);

  const activeJobs = jobs?.filter((j) => ['in_progress', 'matched', 'milestone_review'].includes(j.status)) ?? [];
  const completedJobs = jobs?.filter((j) => j.status === 'completed') ?? [];
  const totalSpent = completedJobs.reduce((sum, j) => sum + (j.final_cost ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋</h1>
          <p className="text-[#6B7280] text-sm mt-0.5">Manage your surface finishing projects</p>
        </div>
        <Link href="/dashboard/homeowner/jobs/new">
          <Button variant="accent"><Plus className="h-4 w-4 mr-2" />New Job</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A2E]">{activeJobs.length}</p>
              <p className="text-xs text-[#6B7280]">Active Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A2E]">{completedJobs.length}</p>
              <p className="text-xs text-[#6B7280]">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 font-bold text-sm">₹</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A2E]">{formatINR(totalSpent)}</p>
              <p className="text-xs text-[#6B7280]">Total Spent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-[#1A1A2E]">Recent Jobs</h2>
          <Link href="/dashboard/homeowner/jobs" className="text-sm text-[#E94560] hover:underline">View all →</Link>
        </div>
        {!jobs || jobs.length === 0 ? (
          <div className="p-10 text-center">
            <span className="text-4xl">🏠</span>
            <p className="text-[#6B7280] mt-3 mb-4">No jobs yet. Get started with a free estimate.</p>
            <Link href="/estimate"><Button variant="accent">Get Free Estimate</Button></Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {jobs.map((job: Job) => (
              <Link key={job.id} href={`/dashboard/homeowner/jobs/${job.id}`}>
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-[#1A1A2E] text-sm">{job.service_category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{job.area_sqft} sqft · {job.zone ?? 'Bengaluru'} · {formatDate(job.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#1A1A2E]">{formatINR(job.final_cost ?? 0)}</span>
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
