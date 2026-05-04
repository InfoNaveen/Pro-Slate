import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import WorkerCard from '@/components/workers/WorkerCard';
import { createClient } from '@/lib/supabase/server';
import type { WorkerWithProfile } from '@/types';
import { ZONE_OPTIONS, SPECIALIZATION_LABELS } from '@/lib/utils';

export const revalidate = 60;

export default async function WorkersPage({ searchParams }: { searchParams: Record<string, string> }) {
  const supabase = createClient();

  let query = supabase
    .from('worker_profiles')
    .select('*, profiles!inner(id, full_name, avatar_url, city)')
    .order('skill_score', { ascending: false })
    .limit(24);

  if (searchParams.badge) query = query.eq('badge', searchParams.badge);
  if (searchParams.zone) query = query.eq('current_zone', searchParams.zone);
  if (searchParams.available === 'true') query = query.eq('available', true);
  if (searchParams.certified === 'true') query = query.eq('certified', true);
  if (searchParams.min_rating) query = query.gte('avg_rating', parseFloat(searchParams.min_rating));
  if (searchParams.spec) query = query.contains('specializations', [searchParams.spec]);

  const { data: workers } = await query;

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A2E]">Verified Surface Finishing Specialists</h1>
          <p className="text-[#6B7280] mt-1">{workers?.length ?? 0} verified workers in Bengaluru</p>
        </div>

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 sticky top-24">
              <h3 className="font-semibold text-[#1A1A2E] mb-4">Filters</h3>

              <div className="mb-5">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Badge Tier</p>
                {['Rookie', 'Verified', 'Expert', 'Master'].map((b) => (
                  <label key={b} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox" className="accent-[#E94560]" />
                    <span className="text-sm text-[#1A1A2E]">{b}</span>
                  </label>
                ))}
              </div>

              <div className="mb-5">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Zone</p>
                {ZONE_OPTIONS.map((z) => (
                  <label key={z} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox" className="accent-[#E94560]" />
                    <span className="text-sm text-[#1A1A2E]">{z}</span>
                  </label>
                ))}
              </div>

              <div className="mb-5">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Specialization</p>
                {Object.entries(SPECIALIZATION_LABELS).slice(0, 6).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox" className="accent-[#E94560]" />
                    <span className="text-sm text-[#1A1A2E]">{label}</span>
                  </label>
                ))}
              </div>

              <div className="mb-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-[#E94560]" />
                  <span className="text-sm font-medium text-[#1A1A2E]">Available Now</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input type="checkbox" className="accent-[#E94560]" />
                  <span className="text-sm font-medium text-[#1A1A2E]">🏅 Certified Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Worker Grid */}
          <div className="flex-1">
            {!workers || workers.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-5xl">👷</span>
                <p className="text-[#6B7280] mt-4">No workers found matching your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {workers.map((worker) => (
                  <WorkerCard key={worker.id} worker={worker as WorkerWithProfile} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
