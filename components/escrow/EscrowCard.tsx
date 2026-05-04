import { Lock, Unlock, RefreshCw } from 'lucide-react';
import { formatINR, formatDateTime } from '@/lib/utils';
import type { EscrowTransaction } from '@/types';

interface EscrowCardProps {
  transactions: EscrowTransaction[];
  totalLocked: number;
  totalReleased: number;
}

function TxIcon({ type }: { type: EscrowTransaction['type'] }) {
  if (type === 'lock') return <Lock className="h-4 w-4 text-[#1A1A2E]" />;
  if (type === 'release') return <Unlock className="h-4 w-4 text-[#10B981]" />;
  return <RefreshCw className="h-4 w-4 text-[#F59E0B]" />;
}

export default function EscrowCard({ transactions, totalLocked, totalReleased }: EscrowCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-card p-5">
      <h3 className="font-semibold text-[#1A1A2E] mb-4">Escrow Summary</h3>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#F5F5F0] rounded-lg p-3">
          <p className="text-xs text-[#6B7280] mb-1">Total Locked</p>
          <p className="text-lg font-bold text-[#1A1A2E]">{formatINR(totalLocked)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-[#6B7280] mb-1">Released</p>
          <p className="text-lg font-bold text-[#10B981]">{formatINR(totalReleased)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Transaction Log</h4>
        {transactions.length === 0 ? (
          <p className="text-sm text-[#6B7280] text-center py-4">No transactions yet</p>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                <TxIcon type={tx.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1A1A2E] capitalize">{tx.type}</span>
                  <span className={`text-sm font-bold ${tx.type === 'release' ? 'text-[#10B981]' : 'text-[#1A1A2E]'}`}>
                    {tx.type === 'release' ? '+' : ''}{formatINR(tx.amount)}
                  </span>
                </div>
                {tx.mock_tx_hash && (
                  <p className="text-xs text-[#6B7280] font-mono truncate mt-0.5">{tx.mock_tx_hash}</p>
                )}
                <p className="text-xs text-[#6B7280] mt-0.5">{formatDateTime(tx.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
