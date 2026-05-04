import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EscrowCard from '@/components/escrow/EscrowCard';
import { formatINR, formatDateTime } from '@/lib/utils';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';

export default async function WorkerEarningsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  // Get all jobs for this worker to find escrow transactions
  const { data: jobs } = await supabase.from('jobs').select('id').eq('worker_id', session.user.id);
  const jobIds = jobs?.map((j) => j.id) ?? [];

  const { data: transactions } = jobIds.length > 0
    ? await supabase.from('escrow_transactions').select('*').in('job_id', jobIds).order('created_at', { ascending: false })
    : { data: [] };

  const released = transactions?.filter((t) => t.type === 'release' && t.status === 'confirmed') ?? [];
  const pending = transactions?.filter((t) => t.type === 'lock' && t.status === 'confirmed') ?? [];
  const totalEarned = released.reduce((s, t) => s + t.amount, 0);
  const totalPending = pending.reduce((s, t) => s + t.amount, 0) - released.reduce((s, t) => s + t.amount, 0);

  // This month
  const now = new Date();
  const thisMonthEarned = released.filter((t) => {
    const d = new Date(t.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">Earnings</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Earned', value: formatINR(totalEarned), icon: DollarSign, color: 'bg-green-50 text-green-600' },
          { label: 'This Month', value: formatINR(thisMonthEarned), icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending Release', value: formatINR(Math.max(0, totalPending)), icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#1A1A2E]">{s.value}</p>
                <p className="text-xs text-[#6B7280]">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EscrowCard
        transactions={transactions ?? []}
        totalLocked={pending.reduce((s, t) => s + t.amount, 0)}
        totalReleased={totalEarned}
      />
    </div>
  );
}
