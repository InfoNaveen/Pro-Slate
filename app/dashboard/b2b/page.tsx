import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatINR, formatDate } from '@/lib/utils';
import { Plus, FileText, Users, Briefcase, TrendingUp, Clock } from 'lucide-react';
import type { B2BContract, Job } from '@/types';

export default async function B2BDashboard() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('*, b2b_client_profiles(*)').eq('id', session.user.id).single();
  const { data: contracts } = await supabase.from('b2b_contracts').select('*').eq('client_id', session.user.id).order('created_at', { ascending: false });
  const { data: jobs } = await supabase.from('jobs').select('*').eq('client_id', session.user.id).eq('is_b2b', true).order('created_at', { ascending: false }).limit(5);

  const activeContracts = contracts?.filter((c) => c.status === 'active') ?? [];
  const totalWorkers = new Set(contracts?.flatMap((c) => c.worker_ids ?? [])).size;
  const thisMonthSpend = jobs?.filter((j) => {
    const d = new Date(j.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, j) => s + (j.final_cost ?? 0), 0) ?? 0;
  const inProgressJobs = jobs?.filter((j) => j.status === 'in_progress') ?? [];

  const companyName = (profile as { b2b_client_profiles?: { company_name?: string } })?.b2b_client_profiles?.company_name ?? 'Your Company';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">{companyName}</h1>
          <p className="text-[#6B7280] text-sm mt-0.5">B2B Labor Management Dashboard</p>
        </div>
        <Link href="/dashboard/b2b/contracts/new">
          <Button variant="accent"><Plus className="h-4 w-4 mr-2" />New Contract</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Contracts', value: activeContracts.length, icon: FileText, color: 'bg-blue-50 text-blue-600' },
          { label: 'Workers Deployed', value: totalWorkers, icon: Users, color: 'bg-purple-50 text-purple-600' },
          { label: 'Spend This Month', value: formatINR(thisMonthSpend), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
          { label: 'Jobs In Progress', value: inProgressJobs.length, icon: Briefcase, color: 'bg-yellow-50 text-yellow-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#1A1A2E]">{stat.value}</p>
                <p className="text-xs text-[#6B7280]">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Contracts */}
        <div className="bg-white rounded-lg shadow-card border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-[#1A1A2E]">Active Contracts</h2>
            <Link href="/dashboard/b2b/contracts" className="text-sm text-[#E94560] hover:underline">View all →</Link>
          </div>
          {activeContracts.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-[#6B7280] mb-3">No active contracts</p>
              <Link href="/dashboard/b2b/contracts/new"><Button variant="accent" size="sm">Create Contract</Button></Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activeContracts.slice(0, 4).map((contract: B2BContract) => (
                <Link key={contract.id} href={`/dashboard/b2b/contracts/${contract.id}`}>
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-[#1A1A2E] text-sm">{contract.title}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{(contract.worker_ids ?? []).length} workers · {contract.service_categories?.join(', ')}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-card border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-[#1A1A2E]">Recent Jobs</h2>
            <Link href="/dashboard/b2b/jobs" className="text-sm text-[#E94560] hover:underline">View all →</Link>
          </div>
          {!jobs || jobs.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-[#6B7280]">No jobs yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {jobs.map((job: Job) => (
                <div key={job.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-[#1A1A2E] text-sm">{job.project_name ?? job.service_category.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{job.area_sqft} sqft · {formatDate(job.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1A1A2E]">{formatINR(job.final_cost ?? 0)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
