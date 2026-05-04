import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDate, formatINR } from '@/lib/utils';
import { Plus, FileText } from 'lucide-react';
import type { B2BContract } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  terminated: 'bg-red-100 text-red-700',
};

export default async function B2BContractsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: contracts } = await supabase
    .from('b2b_contracts')
    .select('*')
    .eq('client_id', session.user.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Contracts</h1>
          <p className="text-[#6B7280] text-sm">{contracts?.length ?? 0} total contracts</p>
        </div>
        <Link href="/dashboard/b2b/contracts/new">
          <Button variant="accent"><Plus className="h-4 w-4 mr-2" />New Contract</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-card border border-gray-100">
        {!contracts || contracts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[#6B7280] mb-4">No contracts yet. Create your first B2B labor contract.</p>
            <Link href="/dashboard/b2b/contracts/new"><Button variant="accent">Create Contract</Button></Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {contracts.map((contract: B2BContract) => (
              <Link key={contract.id} href={`/dashboard/b2b/contracts/${contract.id}`}>
                <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[#1A1A2E]">{contract.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[contract.status]}`}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280]">
                      {(contract.worker_ids ?? []).length} workers · {contract.service_categories?.slice(0, 2).join(', ')}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {contract.start_date && `${formatDate(contract.start_date)} → `}
                      {contract.end_date && formatDate(contract.end_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    {contract.monthly_rate && (
                      <p className="font-bold text-[#1A1A2E]">{formatINR(contract.monthly_rate)}<span className="text-xs text-[#6B7280] font-normal">/mo</span></p>
                    )}
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
