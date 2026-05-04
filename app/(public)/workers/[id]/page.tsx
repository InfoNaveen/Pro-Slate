import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import BadgeChip from '@/components/workers/BadgeChip';
import CertifiedBadge from '@/components/workers/CertifiedBadge';
import SpecializationBadge from '@/components/workers/SpecializationBadge';
import SkillScoreBar from '@/components/workers/SkillScoreBar';
import { createClient } from '@/lib/supabase/server';
import { formatINR, formatDate, SPECIALIZATION_LABELS } from '@/lib/utils';
import { MapPin, Star, Briefcase, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const revalidate = 60;

export default async function WorkerProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: worker } = await supabase
    .from('worker_profiles')
    .select('*, profiles!inner(id, full_name, avatar_url, city, phone)')
    .eq('id', params.id)
    .single();

  if (!worker) notFound();

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles!reviews_reviewer_id_fkey(full_name)')
    .eq('worker_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6 sticky top-24">
              <div className="text-center mb-5">
                <div className="w-20 h-20 bg-[#1A1A2E] rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-3">
                  {worker.profiles.full_name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-xl font-bold text-[#1A1A2E]">{worker.profiles.full_name}</h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <BadgeChip badge={worker.badge} />
                  {worker.certified && <CertifiedBadge />}
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <SkillScoreBar score={worker.skill_score} badge={worker.badge} label="Skill Score" showTiers />
                <SkillScoreBar score={worker.reliability_score} badge={worker.badge} label="Reliability Score" />
              </div>

              <div className="grid grid-cols-2 gap-3 py-4 border-t border-b border-gray-100 mb-5">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#1A1A2E]">{worker.total_jobs}</p>
                  <p className="text-xs text-[#6B7280]">Total Jobs</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#1A1A2E]">{worker.completion_rate.toFixed(0)}%</p>
                  <p className="text-xs text-[#6B7280]">Completion</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#1A1A2E]">{worker.avg_rating.toFixed(1)}★</p>
                  <p className="text-xs text-[#6B7280]">Avg Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#1A1A2E]">{worker.experience_years}y</p>
                  <p className="text-xs text-[#6B7280]">Experience</p>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {worker.current_zone && (
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <MapPin className="h-4 w-4" />
                    {worker.current_zone}, Bengaluru
                  </div>
                )}
                {worker.daily_rate && (
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Briefcase className="h-4 w-4" />
                    {formatINR(worker.daily_rate)} / day
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${worker.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className={worker.available ? 'text-green-700' : 'text-gray-500'}>
                    {worker.available ? 'Available for work' : 'Currently busy'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Link href="/auth/signup">
                  <Button variant="accent" className="w-full">Book This Worker</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full">Add to Project</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Bio */}
            {worker.bio && (
              <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
                <h2 className="font-semibold text-[#1A1A2E] mb-2">About</h2>
                <p className="text-sm text-[#6B7280] leading-relaxed">{worker.bio}</p>
              </div>
            )}

            {/* Specializations */}
            <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
              <h2 className="font-semibold text-[#1A1A2E] mb-3">Specializations</h2>
              <div className="flex flex-wrap gap-2">
                {worker.specializations.map((spec: string) => (
                  <span key={spec} className="text-xs bg-gray-50 text-[#6B7280] border border-gray-200 px-2.5 py-1 rounded-full">
                    {SPECIALIZATION_LABELS[spec] ?? spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Earned Badges */}
            {worker.badge_specializations && worker.badge_specializations.length > 0 && (
              <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
                <h2 className="font-semibold text-[#1A1A2E] mb-3">Earned Badges</h2>
                <div className="flex flex-wrap gap-2">
                  {worker.badge_specializations.map((badge: string) => (
                    <SpecializationBadge key={badge} name={badge} />
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {worker.portfolio_urls && worker.portfolio_urls.length > 0 && (
              <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
                <h2 className="font-semibold text-[#1A1A2E] mb-3">Portfolio</h2>
                <div className="grid grid-cols-3 gap-2">
                  {worker.portfolio_urls.map((url: string, i: number) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
              <h2 className="font-semibold text-[#1A1A2E] mb-4">Reviews ({reviews?.length ?? 0})</h2>
              {!reviews || reviews.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-[#1A1A2E]">{review.profiles?.full_name ?? 'Client'}</p>
                          <p className="text-xs text-[#6B7280]">{formatDate(review.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4 mb-2">
                        <span className="text-xs text-[#6B7280]">Quality: <span className="font-medium text-[#1A1A2E]">{review.quality_rating}/5</span></span>
                        <span className="text-xs text-[#6B7280]">Punctuality: <span className="font-medium text-[#1A1A2E]">{review.punctuality_rating}/5</span></span>
                      </div>
                      {review.comment && <p className="text-sm text-[#6B7280]">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
