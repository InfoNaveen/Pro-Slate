'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface DisputeRow {
  id: string;
  job_id: string;
  reason: string;
  status: string;
  resolution: string | null;
  created_at: string;
  profiles: { full_name: string };
  jobs: { service_category: string; zone: string };
}

export default function AdminDisputesPage() {
  const supabase = createClient();
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Record<string, string>>({});

  const fetchDisputes = async () => {
    const { data } = await supabase
      .from('disputes')
      .select('*, profiles!disputes_raised_by_fkey(full_name), jobs!inner(service_category, zone)')
      .order('created_at', { ascending: false });
    setDisputes((data ?? []) as DisputeRow[]);
    setLoading(false);
  };

  useEffect(() => { fetchDisputes(); }, []);

  const resolve = async (id: string) => {
    const resolution = resolutions[id];
    if (!resolution?.trim()) { alert('Enter resolution text'); return; }
    setProcessing(id);
    await fetch(`/api/disputes/${id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution }),
    });
    await fetchDisputes();
    setProcessing(null);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#E94560]" /></div>;

  const open = disputes.filter((d) => d.status === 'open');
  const resolved = disputes.filter((d) => d.status === 'resolved');

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">Disputes</h1>

      {open.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-[#1A1A2E] mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#E94560]" />
            Open Disputes ({open.length})
          </h2>
          <div className="space-y-4">
            {open.map((d) => (
              <div key={d.id} className="bg-white rounded-lg shadow-card border border-red-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-[#1A1A2E]">{d.jobs?.service_category?.replace(/_/g, ' ')} · {d.jobs?.zone}</p>
                    <p className="text-sm text-[#6B7280]">Raised by: {d.profiles?.full_name} · {formatDate(d.created_at)}</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">Open</span>
                </div>
                <div className="p-3 bg-red-50 rounded-lg mb-4">
                  <p className="text-sm text-red-700">{d.reason}</p>
                </div>
                <div className="flex gap-3">
                  <textarea
                    placeholder="Resolution details..."
                    className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A2E] h-16 resize-none"
                    onChange={(e) => setResolutions((prev) => ({ ...prev, [d.id]: e.target.value }))}
                  />
                  <Button variant="success" onClick={() => resolve(d.id)} disabled={processing === d.id}>
                    {processing === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-1" />Resolve</>}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="font-semibold text-[#1A1A2E] mb-4">Resolved ({resolved.length})</h2>
          <div className="space-y-3">
            {resolved.map((d) => (
              <div key={d.id} className="bg-white rounded-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1A1A2E] text-sm">{d.jobs?.service_category?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-[#6B7280]">{d.profiles?.full_name} · {formatDate(d.created_at)}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">Resolved</span>
                </div>
                {d.resolution && <p className="text-xs text-[#6B7280] mt-2 italic">{d.resolution}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {disputes.length === 0 && (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-[#6B7280]">No disputes. Platform is running smoothly.</p>
        </div>
      )}
    </div>
  );
}
