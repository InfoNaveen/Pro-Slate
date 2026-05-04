import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Shield, CheckCircle, Clock, XCircle } from 'lucide-react';

export default async function WorkerVerificationsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: verifications } = await supabase
    .from('worker_verifications').select('*').eq('worker_id', session.user.id).order('created_at', { ascending: false });

  const { data: worker } = await supabase.from('worker_profiles').select('verified_at, certified').eq('id', session.user.id).single();

  const STATUS_ICON = {
    approved: <CheckCircle className="h-5 w-5 text-green-600" />,
    pending: <Clock className="h-5 w-5 text-yellow-600" />,
    rejected: <XCircle className="h-5 w-5 text-red-600" />,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">Verifications</h1>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className={`rounded-lg border p-5 ${worker?.verified_at ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Shield className={`h-6 w-6 ${worker?.verified_at ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <p className="font-semibold text-[#1A1A2E]">Identity Verification</p>
              <p className="text-xs text-[#6B7280]">{worker?.verified_at ? `Verified on ${formatDate(worker.verified_at)}` : 'Not yet verified'}</p>
            </div>
          </div>
        </div>
        <div className={`rounded-lg border p-5 ${worker?.certified ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{worker?.certified ? '🏅' : '⭕'}</span>
            <div>
              <p className="font-semibold text-[#1A1A2E]">ProSlate Certified</p>
              <p className="text-xs text-[#6B7280]">{worker?.certified ? 'You are a Certified Partner!' : 'Complete 10+ jobs with Expert badge to qualify'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification history */}
      <div className="bg-white rounded-lg shadow-card border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-[#1A1A2E]">Verification History</h2>
        </div>
        {!verifications || verifications.length === 0 ? (
          <div className="p-10 text-center">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[#6B7280] text-sm">No verifications submitted yet</p>
            <p className="text-xs text-[#6B7280] mt-1">Contact support to start your verification process</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {verifications.map((v) => (
              <div key={v.id} className="flex items-center gap-4 p-4">
                {STATUS_ICON[v.status as keyof typeof STATUS_ICON]}
                <div className="flex-1">
                  <p className="font-medium text-[#1A1A2E] text-sm capitalize">{v.verification_type?.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-[#6B7280]">{formatDate(v.created_at)}</p>
                  {v.notes && <p className="text-xs text-[#6B7280] mt-0.5 italic">{v.notes}</p>}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${v.status === 'approved' ? 'bg-green-100 text-green-700' : v.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
