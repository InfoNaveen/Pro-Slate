import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatDate, formatINR } from '@/lib/utils';
import type { B2BContract } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  terminated: 'bg-red-100 text-red-700',
};

export default async function AdminContractsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: contracts } = await supabase
    .from('b2b_contracts')
    .select('*, profiles!b2b_contracts_client_id_fkey(full_name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">B2B Contracts ({contracts?.length ?? 0})</h1>
      <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Contract</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Client</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Workers</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Monthly Rate</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Status</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(contracts ?? []).map((c: B2BContract & { profiles?: { full_name: string } }) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium text-[#1A1A2E]">{c.title}</p>
                  <p className="text-xs text-[#6B7280]">{c.service_categories?.slice(0, 2).join(', ')}</p>
                </td>
                <td className="p-4 text-[#6B7280]">{c.profiles?.full_name ?? '—'}</td>
                <td className="p-4 text-[#6B7280]">{(c.worker_ids ?? []).length}</td>
                <td className="p-4 font-medium text-[#1A1A2E]">{c.monthly_rate ? formatINR(c.monthly_rate) : '—'}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </td>
                <td className="p-4 text-[#6B7280]">{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!contracts || contracts.length === 0) && (
          <div className="p-12 text-center"><p className="text-[#6B7280]">No contracts yet</p></div>
        )}
      </div>
    </div>
  );
}
