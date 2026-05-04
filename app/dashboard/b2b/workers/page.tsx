import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import WorkerCard from '@/components/workers/WorkerCard';
import type { WorkerWithProfile } from '@/types';

export default async function B2BWorkersPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: profile } = await supabase.from('b2b_client_profiles').select('preferred_worker_ids').eq('id', session.user.id).single();
  const preferredIds: string[] = profile?.preferred_worker_ids ?? [];

  const { data: allWorkers } = await supabase
    .from('worker_profiles')
    .select('*, profiles!inner(id, full_name, avatar_url, city)')
    .eq('available', true)
    .order('skill_score', { ascending: false })
    .limit(20);

  const preferred = allWorkers?.filter((w) => preferredIds.includes(w.id)) ?? [];
  const others = allWorkers?.filter((w) => !preferredIds.includes(w.id)) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2">Worker Pool</h1>
      <p className="text-[#6B7280] text-sm mb-6">Browse and add verified workers to your contracts</p>

      {preferred.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-[#1A1A2E] mb-4">⭐ Preferred Workers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {preferred.map((w) => <WorkerCard key={w.id} worker={w as WorkerWithProfile} />)}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-[#1A1A2E] mb-4">Available Workers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {others.map((w) => <WorkerCard key={w.id} worker={w as WorkerWithProfile} />)}
        </div>
      </div>
    </div>
  );
}
