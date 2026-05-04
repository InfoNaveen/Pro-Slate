import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import WorkerCard from '@/components/workers/WorkerCard';
import { createClient } from '@/lib/supabase/server';
import { formatINR, SERVICE_CATEGORY_ICONS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { WorkerWithProfile } from '@/types';

export const revalidate = 60;

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: category } = await supabase
    .from('service_categories')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!category) notFound();

  // Find workers with matching specializations
  const { data: workers } = await supabase
    .from('worker_profiles')
    .select('*, profiles!inner(id, full_name, avatar_url, city)')
    .contains('specializations', [params.slug.replace('-', '_')])
    .eq('available', true)
    .order('skill_score', { ascending: false })
    .limit(9);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#1A1A2E] text-white py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-6">
            <span className="text-5xl">{SERVICE_CATEGORY_ICONS[category.slug] ?? '🔧'}</span>
            <div>
              <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
              <p className="text-gray-300 mb-4">{category.description}</p>
              <div className="flex items-center gap-4">
                {category.base_rate_per_sqft && (
                  <span className="text-[#E94560] font-semibold">Starting {formatINR(category.base_rate_per_sqft)}/sqft</span>
                )}
                <Link href="/estimate">
                  <Button variant="accent">Get Free Estimate</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Surface types */}
        {category.surface_types && (
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-8">
            <h2 className="font-semibold text-[#1A1A2E] mb-3">Surface Types We Handle</h2>
            <div className="flex flex-wrap gap-2">
              {category.surface_types.map((st: string) => (
                <span key={st} className="text-sm bg-gray-50 text-[#6B7280] border border-gray-200 px-3 py-1 rounded-full">{st}</span>
              ))}
            </div>
          </div>
        )}

        {/* Workers */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#1A1A2E]">Available Specialists ({workers?.length ?? 0})</h2>
            <Link href={`/workers?spec=${params.slug}`}>
              <Button variant="outline" size="sm">View All →</Button>
            </Link>
          </div>
          {!workers || workers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
              <span className="text-4xl">👷</span>
              <p className="text-[#6B7280] mt-3">No workers available right now. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((worker: any) => (
                <WorkerCard key={worker.id} worker={worker as WorkerWithProfile} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
