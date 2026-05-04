'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MilestoneTracker from '@/components/milestones/MilestoneTracker';
import CVResultCard from '@/components/milestones/CVResultCard';
import JobStatusBadge from '@/components/shared/JobStatusBadge';
import { Button } from '@/components/ui/button';
import { formatINR, formatDate } from '@/lib/utils';
import { ArrowLeft, Upload, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import type { Job, Milestone, CVMetadata } from '@/types';

export default function WorkerJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [job, setJob] = useState<Job & { milestones: Milestone[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cvResult, setCvResult] = useState<{ cv_score: number; cv_verdict: 'PASS' | 'REVIEW'; cv_metadata: CVMetadata } | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [activeStage, setActiveStage] = useState<Milestone | null>(null);

  const fetchJob = useCallback(async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*, milestones(*)')
      .eq('id', params.id as string)
      .single();
    if (data) {
      setJob(data as Job & { milestones: Milestone[] });
      const milestones = (data.milestones ?? []).sort((a: Milestone, b: Milestone) => a.stage - b.stage);
      const pending = milestones.find((m: Milestone) => m.status === 'pending' || m.status === 'rejected');
      setActiveStage(pending ?? null);
    }
    setLoading(false);
  }, [params.id, supabase]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  const addMockPhoto = () => {
    const mockUrls = [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    ];
    if (photoUrls.length < 4) {
      setPhotoUrls([...photoUrls, mockUrls[photoUrls.length % mockUrls.length]]);
    }
  };

  const submitMilestone = async () => {
    if (!activeStage || photoUrls.length === 0) return;
    setSubmitting(true);
    const res = await fetch(`/api/milestones/${activeStage.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_urls: photoUrls, worker_note: note }),
    });
    const data = await res.json();
    if (data.success) {
      setCvResult(data.cv);
      await fetchJob();
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#E94560]" /></div>;
  if (!job) return <div className="text-center py-20"><p className="text-[#6B7280]">Job not found</p></div>;

  const milestones = (job.milestones ?? []).sort((a, b) => a.stage - b.stage);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/worker/jobs">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1A1A2E]">{job.service_category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</h1>
            <JobStatusBadge status={job.status} />
          </div>
          <p className="text-[#6B7280] text-sm">{job.area_sqft} sqft · {job.zone} · {formatDate(job.created_at)}</p>
        </div>
        <p className="text-xl font-bold text-[#1A1A2E]">{formatINR(job.final_cost ?? 0)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Tracker */}
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
          <h2 className="font-semibold text-[#1A1A2E] mb-4">Milestone Progress</h2>
          <MilestoneTracker milestones={milestones} totalCost={job.final_cost ?? 0} />
        </div>

        {/* Active Milestone Submission */}
        <div className="space-y-4">
          {activeStage ? (
            <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
              <h2 className="font-semibold text-[#1A1A2E] mb-1">Submit Stage {activeStage.stage}</h2>
              <p className="text-sm text-[#6B7280] mb-4">{activeStage.name}</p>

              {/* Photo upload area */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {photoUrls.map((url, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                {photoUrls.length < 4 && (
                  <button onClick={addMockPhoto} className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
                    <Upload className="h-4 w-4" />
                    Add Photo ({photoUrls.length}/4)
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Work Note (optional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe what was completed..." className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A2E] h-20 resize-none" />
              </div>

              <Button variant="accent" className="w-full" onClick={submitMilestone} disabled={submitting || photoUrls.length === 0}>
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><Upload className="h-4 w-4 mr-2" />Submit for Verification</>}
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 text-center">
              <CheckCircle className="h-12 w-12 text-[#10B981] mx-auto mb-3" />
              <p className="font-semibold text-[#1A1A2E]">All milestones submitted</p>
              <p className="text-sm text-[#6B7280] mt-1">Awaiting admin review and payment release</p>
            </div>
          )}

          {/* CV Result */}
          {cvResult && (
            <CVResultCard score={cvResult.cv_score} verdict={cvResult.cv_verdict} metadata={cvResult.cv_metadata} />
          )}

          {/* Submitted milestone CV results */}
          {milestones.filter((m) => m.cv_score !== null && m.status !== 'pending').map((m) => (
            m.cv_metadata && (
              <div key={m.id}>
                <p className="text-xs font-semibold text-[#6B7280] mb-2">Stage {m.stage} CV Result</p>
                <CVResultCard score={m.cv_score!} verdict={m.cv_verdict as 'PASS' | 'REVIEW'} metadata={m.cv_metadata as CVMetadata} />
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
