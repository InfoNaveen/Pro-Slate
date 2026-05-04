'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';

interface VerificationRequest {
  id: string;
  worker_id: string;
  verification_type: string;
  status: string;
  documents: string[] | null;
  notes: string | null;
  created_at: string;
  worker_profiles: { profiles: { full_name: string } };
}

export default function AdminVerificationsPage() {
  const supabase = createClient();
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const fetchVerifications = async () => {
    const { data } = await supabase
      .from('worker_verifications')
      .select('*, worker_profiles!inner(profiles!inner(full_name))')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    setVerifications((data ?? []) as VerificationRequest[]);
    setLoading(false);
  };

  useEffect(() => { fetchVerifications(); }, []);

  const handle = async (workerId: string, status: 'approved' | 'rejected') => {
    setProcessing(workerId);
    await fetch(`/api/admin/workers/${workerId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes: note, verification_type: 'identity' }),
    });
    await fetchVerifications();
    setProcessing(null);
    setNote('');
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#E94560]" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">Pending Verifications ({verifications.length})</h1>
      {verifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-12 text-center">
          <Shield className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-[#6B7280]">No pending verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((v) => (
            <div key={v.id} className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-[#1A1A2E]">{v.worker_profiles?.profiles?.full_name ?? 'Worker'}</p>
                  <p className="text-sm text-[#6B7280] capitalize">{v.verification_type?.replace(/_/g, ' ')} · {formatDate(v.created_at)}</p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
              </div>
              {v.notes && <p className="text-sm text-[#6B7280] mb-4 p-3 bg-gray-50 rounded-lg">{v.notes}</p>}
              <div className="flex gap-3">
                <input type="text" placeholder="Notes (optional)" className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A2E]" onChange={(e) => setNote(e.target.value)} />
                <Button variant="success" onClick={() => handle(v.worker_id, 'approved')} disabled={processing === v.worker_id}>
                  {processing === v.worker_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-1" />Approve</>}
                </Button>
                <Button variant="destructive" onClick={() => handle(v.worker_id, 'rejected')} disabled={processing === v.worker_id}>
                  <XCircle className="h-4 w-4 mr-1" />Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
