import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatINR, formatDateTime } from '@/lib/utils';
import { Lock, Unlock, RefreshCw } from 'lucide-react';

export default async function AdminEscrowPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: transactions } = await supabase
    .from('escrow_transactions')
    .select('*, jobs!inner(service_category, zone)')
    .order('created_at', { ascending: false })
    .limit(100);

  const totalLocked = transactions?.filter((t) => t.type === 'lock').reduce((s, t) => s + t.amount, 0) ?? 0;
  const totalReleased = transactions?.filter((t) => t.type === 'release').reduce((s, t) => s + t.amount, 0) ?? 0;
  const totalRefunded = transactions?.filter((t) => t.type === 'refund').reduce((s, t) => s + t.amount, 0) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">Escrow Ledger</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Locked', value: formatINR(totalLocked), icon: Lock, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Released', value: formatINR(totalReleased), icon: Unlock, color: 'bg-green-50 text-green-600' },
          { label: 'Total Refunded', value: formatINR(totalRefunded), icon: RefreshCw, color: 'bg-yellow-50 text-yellow-600' },
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

      <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-[#1A1A2E]">Transaction Log ({transactions?.length ?? 0})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Type</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Job</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Amount</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Status</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">TX Hash</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(transactions ?? []).map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${tx.type === 'release' ? 'bg-green-100 text-green-700' : tx.type === 'lock' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {tx.type}
                  </span>
                </td>
                <td className="p-4 text-[#6B7280]">{tx.jobs?.service_category?.replace(/_/g, ' ') ?? '—'}</td>
                <td className="p-4 font-semibold text-[#1A1A2E]">{formatINR(tx.amount)}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tx.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{tx.status}</span>
                </td>
                <td className="p-4 font-mono text-xs text-[#6B7280] max-w-xs truncate">{tx.mock_tx_hash ?? '—'}</td>
                <td className="p-4 text-[#6B7280]">{formatDateTime(tx.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!transactions || transactions.length === 0) && (
          <div className="p-12 text-center"><p className="text-[#6B7280]">No transactions yet</p></div>
        )}
      </div>
    </div>
  );
}
