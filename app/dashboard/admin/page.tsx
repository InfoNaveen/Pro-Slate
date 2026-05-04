import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatINR } from '@/lib/utils';
import { Briefcase, Users, CheckSquare, AlertTriangle, Lock, FileText, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/auth/login');

  const [
    { count: totalJobs },
    { count: activeJobs },
    { count: completedJobs },
    { count: totalWorkers },
    { count: certifiedWorkers },
    { count: pendingMilestones },
    { count: openDisputes },
    { count: totalContracts },
    { data: escrowData },
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('worker_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('worker_profiles').select('*', { count: 'exact', head: true }).eq('certified', true),
    supabase.from('milestones').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('b2b_contracts').select('*', { count: 'exact', head: true }),
    supabase.from('escrow_transactions').select('amount').eq('type', 'release').eq('status', 'confirmed'),
  ]);

  const totalEscrow = escrowData?.reduce((s, t) => s + t.amount, 0) ?? 0;

  const stats = [
    { label: 'Total Jobs', value: totalJobs ?? 0, icon: Briefcase, color: 'bg-blue-50 text-blue-600', href: '/dashboard/admin/jobs' },
    { label: 'Active Jobs', value: activeJobs ?? 0, icon: TrendingUp, color: 'bg-green-50 text-green-600', href: '/dashboard/admin/jobs' },
    { label: 'Completed', value: completedJobs ?? 0, icon: CheckSquare, color: 'bg-emerald-50 text-emerald-600', href: '/dashboard/admin/jobs' },
    { label: 'Total Workers', value: totalWorkers ?? 0, icon: Users, color: 'bg-purple-50 text-purple-600', href: '/dashboard/admin/workers' },
    { label: 'Certified', value: certifiedWorkers ?? 0, icon: Award, color: 'bg-yellow-50 text-yellow-600', href: '/dashboard/admin/workers' },
    { label: 'Pending Reviews', value: pendingMilestones ?? 0, icon: CheckSquare, color: 'bg-orange-50 text-orange-600', href: '/dashboard/admin/milestones' },
    { label: 'Open Disputes', value: openDisputes ?? 0, icon: AlertTriangle, color: 'bg-red-50 text-red-600', href: '/dashboard/admin/disputes' },
    { label: 'B2B Contracts', value: totalContracts ?? 0, icon: FileText, color: 'bg-indigo-50 text-indigo-600', href: '/dashboard/admin/contracts' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Platform Overview</h1>
        <p className="text-[#6B7280] text-sm mt-0.5">ProSlate Admin Dashboard</p>
      </div>

      {/* Escrow highlight */}
      <div className="bg-[#1A1A2E] rounded-lg p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Lock className="h-5 w-5 text-[#E94560]" />
          <span className="text-sm font-medium text-gray-300">Total Escrow Released</span>
        </div>
        <p className="text-4xl font-bold">{formatINR(totalEscrow)}</p>
        <p className="text-gray-400 text-sm mt-1">Across all completed milestones</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 hover:shadow-card-hover transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{s.value}</p>
                  <p className="text-xs text-[#6B7280]">{s.label}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Review Pending Milestones', href: '/dashboard/admin/milestones', count: pendingMilestones ?? 0, urgent: true },
          { label: 'Resolve Open Disputes', href: '/dashboard/admin/disputes', count: openDisputes ?? 0, urgent: (openDisputes ?? 0) > 0 },
          { label: 'Approve Verifications', href: '/dashboard/admin/verifications', count: 0, urgent: false },
        ].map((action) => (
          <Link key={action.label} href={action.href}>
            <div className={`rounded-lg border p-4 cursor-pointer hover:shadow-card-hover transition-shadow ${action.urgent && action.count > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#1A1A2E]">{action.label}</p>
                {action.count > 0 && (
                  <span className="bg-[#E94560] text-white text-xs font-bold px-2 py-0.5 rounded-full">{action.count}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
