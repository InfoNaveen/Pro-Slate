'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import CVResultCard from '@/components/milestones/CVResultCard';
import { Button } from '@/components/ui/button';
import { formatINR, formatDateTime } from '@/lib/utils';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { Milestone, CVMetadata } from '@/types';

interface MilestoneWithJob extends Milestone {
  jobs: { service_category: string; final_cost: number; zone: string; profiles: { full_name: string } };
}

export default function AdminMilestonesPage() {
  const supabase = createClient();
  const [milestones, setMilestones] = useState<MilestoneWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const fetchMilestones = async () => {
    const { data } = await supabase
      .from('milestones')
      .select('*, jobs!inner(service_category, final_cost, zone, profiles!jobs_client_id_fkey(full_name))')
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true });
    setMilestones((data ?? []) as MilestoneWithJob[]);
    setLoading(false);
  };

  useEffect(() => { fetchMilestones(); }, []);

  const approve = async (id: string) => {
    setProcessing(id);
    await fetch(`/api/milestones/${id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ admin_note: note }) });
    await fetchMilestones();
    setProcessing(null);
    setNote('');
  };

  const reject = async (id: string) => {
    if (!note.trim()) { alert('Please add a rejection reason'); return; }
    setProcessing(id);
    await fetch(`/api/milestones/${id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ admin_note: note }) });
    await fetchMilestones();
    setProcessing(null);
    setNote('');
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#E94560]" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2">Pending Milestone Reviews</h1>
      <p className="text-[#6B7280] text-sm mb-6">{milestones.length} milestones awaiting review</p>

      {milestones.length === 0 ? (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-[#6B7280]">All milestones reviewed. Nothing pending.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {milestones.map((m) => (
            <div key={m.id} className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#6B7280] uppercase">Stage {m.stage}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Submitted</span>
                  </div>
                  <h3 className="font-bold text-[#1A1A2E]">{m.name}</h3>
                  <p className="text-sm text-[#6B7280]">{m.jobs.service_category.replace(/_/g, ' ')} · {m.jobs.zone} · {m.jobs.profiles?.full_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1A1A2E]">{formatINR(m.jobs.final_cost * m.payment_pct / 100)}</p>
                  <p className="text-xs text-[#6B7280]">{m.payment_pct}% of job</p>
                </div>
              </div>

              {/* Photos */}
              {m.photo_urls && m.photo_urls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {m.photo_urls.map((url, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* CV Result */}
              {m.cv_score !== null && m.cv_metadata && (
                <div className="mb-4">
                  <CVResultCard score={m.cv_score!} verdict={m.cv_verdict as 'PASS' | 'REVIEW'} metadata={m.cv_metadata as CVMetadata} />
                </div>
              )}

              {m.admin_note && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-[#6B7280]">Worker note: {m.admin_note}</p>
                </div>
              )}

              <p className="text-xs text-[#6B7280] mb-3">Submitted: {m.submitted_at ? formatDateTime(m.submitted_at) : '—'}</p>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Admin note (required for rejection)"
                  className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A2E]"
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button variant="success" onClick={() => approve(m.id)} disabled={processing === m.id}>
                  {processing === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-1" />Approve & Release</>}
                </Button>
                <Button variant="destructive" onClick={() => reject(m.id)} disabled={processing === m.id}>
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
