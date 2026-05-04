import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { createClient } from '@/lib/supabase/server';
import { formatINR } from '@/lib/utils';
import { SERVICE_CATEGORY_ICONS } from '@/lib/utils';

export const revalidate = 3600;

export default async function ServicesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from('service_categories').select('*').eq('active', true).order('name');

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#1A1A2E]">Surface Finishing Services</h1>
          <p className="text-[#6B7280] mt-2">9 specializations. Verified workers. Milestone-based payments.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(categories ?? []).map((cat) => (
            <Link key={cat.slug} href={`/services/${cat.slug}`}>
              <div className="bg-white rounded-lg shadow-card border border-gray-100 hover:shadow-card-hover hover:border-[#E94560]/30 transition-all p-6 cursor-pointer group h-full">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{SERVICE_CATEGORY_ICONS[cat.slug] ?? '🔧'}</span>
                  {cat.base_rate_per_sqft && (
                    <span className="text-xs font-semibold text-[#E94560] bg-red-50 px-2 py-0.5 rounded-full">
                      From {formatINR(cat.base_rate_per_sqft)}/sqft
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{cat.name}</h3>
                <p className="text-sm text-[#6B7280] mb-4 leading-relaxed">{cat.description}</p>
                {cat.surface_types && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cat.surface_types.slice(0, 3).map((st: string) => (
                      <span key={st} className="text-xs bg-gray-50 text-[#6B7280] border border-gray-200 px-2 py-0.5 rounded-full">{st}</span>
                    ))}
                  </div>
                )}
                <span className="text-sm text-[#E94560] font-medium group-hover:underline">View Workers & Book →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
