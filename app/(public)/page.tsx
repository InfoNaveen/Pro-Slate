import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Star, Shield, Clock, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

const SERVICE_CATEGORIES = [
  { name: 'Tile Laying', slug: 'tile_laying', icon: '🪟', rate: '₹55/sqft', desc: 'Ceramic, GVT, Vitrified' },
  { name: 'Marble Installation', slug: 'marble_installation', icon: '💎', rate: '₹180/sqft', desc: 'Italian, Indian marble' },
  { name: 'Epoxy Grouting', slug: 'epoxy_grouting', icon: '🔵', rate: '₹200/sqft', desc: 'Seamless epoxy floors' },
  { name: 'Waterproofing', slug: 'waterproofing', icon: '💧', rate: '₹90/sqft', desc: 'Membrane & chemical' },
  { name: 'Stone Polishing', slug: 'stone_polishing', icon: '✨', rate: '₹220/sqft', desc: 'Natural stone finish' },
  { name: 'Large Format Tile', slug: 'large_format_tile', icon: '⬛', rate: '₹120/sqft', desc: '800mm+ format tiles' },
  { name: 'Floor Leveling', slug: 'floor_leveling', icon: '📐', rate: '₹85/sqft', desc: 'Self-leveling compound' },
  { name: 'Tile Repair', slug: 'tile_repair', icon: '🔧', rate: '₹55/sqft', desc: 'Crack & chip repair' },
  { name: 'Wall Cladding', slug: 'wall_cladding', icon: '🧱', rate: '₹120/sqft', desc: 'Stone & tile cladding' },
];

const SAMPLE_WORKERS = [
  { name: 'Ravi Kumar', badge: 'Master', certified: true, rating: 4.9, jobs: 87, zone: 'Whitefield', spec: 'Marble Specialist', score: 94 },
  { name: 'Suresh Nair', badge: 'Expert', certified: true, rating: 4.7, jobs: 52, zone: 'HSR Layout', spec: 'Epoxy Certified', score: 78 },
  { name: 'Mohan Das', badge: 'Master', certified: true, rating: 4.8, jobs: 63, zone: 'Sarjapur', spec: 'Waterproofing Trained', score: 88 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section className="bg-[#1A1A2E] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#E94560]/20 border border-[#E94560]/30 rounded-full px-3 py-1 mb-6">
                <span className="text-[#E94560] text-xs font-semibold">🏆 Bengaluru's #1 Surface Finishing Platform</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                India's Verified<br />
                <span className="text-[#E94560]">Surface Finishing</span><br />
                Network
              </h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Tile, Marble, Epoxy, Waterproofing — Done Right. Every Time.<br />
                Verified specialists. Milestone-based payments. Zero advance required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/estimate">
                  <Button variant="accent" size="xl">Get Free Estimate</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" size="xl" className="border-white text-white hover:bg-white hover:text-[#1A1A2E]">
                    I'm a Professional
                  </Button>
                </Link>
              </div>
            </div>

            {/* Worker badge card mockup */}
            <div className="hidden lg:flex justify-center">
              <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1A1A2E] rounded-full flex items-center justify-center text-white font-bold text-lg">R</div>
                    <div>
                      <p className="font-bold text-[#1A1A2E]">Ravi Kumar</p>
                      <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-400 px-2 py-0.5 rounded-full font-semibold">👑 Master</span>
                    </div>
                  </div>
                  <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-400 px-2 py-0.5 rounded-full font-semibold">🏅 Certified</span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                    <span>Skill Score</span>
                    <span className="font-bold text-[#1A1A2E]">94/100</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center py-3 border-t border-b border-gray-100 mb-4">
                  <div><p className="font-bold text-[#1A1A2E] text-sm">87</p><p className="text-xs text-[#6B7280]">Jobs</p></div>
                  <div><p className="font-bold text-[#1A1A2E] text-sm">4.9★</p><p className="text-xs text-[#6B7280]">Rating</p></div>
                  <div><p className="font-bold text-[#1A1A2E] text-sm">98%</p><p className="text-xs text-[#6B7280]">Completion</p></div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">💎 Marble Specialist</span>
                  <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">✨ Stone Polishing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-[#F5F5F0] py-10 px-4 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { stat: '2,000+', label: 'Verified Workers', icon: '👷' },
              { stat: '9', label: 'Surface Specializations', icon: '🏆' },
              { stat: '₹0', label: 'Advance Required', icon: '🔒' },
              { stat: '35%', label: 'Higher Project Completion', icon: '📈' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-2xl font-bold text-[#1A1A2E]">{item.stat}</p>
                <p className="text-sm text-[#6B7280]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE CATEGORIES */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E]">9 Surface Specializations</h2>
            <p className="text-[#6B7280] mt-2">Every surface finishing need, covered by verified specialists</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {SERVICE_CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/services/${cat.slug}`}>
                <div className="bg-white rounded-lg border border-gray-100 shadow-card hover:shadow-card-hover hover:border-[#E94560]/30 transition-all p-5 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="text-xs font-semibold text-[#E94560] bg-red-50 px-2 py-0.5 rounded-full">Starting {cat.rate}</span>
                  </div>
                  <h3 className="font-semibold text-[#1A1A2E] mb-1">{cat.name}</h3>
                  <p className="text-xs text-[#6B7280] mb-3">{cat.desc}</p>
                  <span className="text-xs text-[#E94560] font-medium group-hover:underline">View Workers →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#F5F5F0] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E]">How ProSlate Works</h2>
            <p className="text-[#6B7280] mt-2">Three steps to a perfectly finished surface</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Get Instant Estimate',
                desc: 'Describe your project — surface type, area, complexity. Our Surface Pricing Engine gives you an accurate cost breakdown in seconds.',
                icon: '📊',
                cta: 'Try Estimator',
                href: '/estimate',
              },
              {
                step: '02',
                title: 'Match with Verified Specialist',
                desc: 'Browse workers by badge tier, specialization, zone, and rating. Every worker is identity-verified and skill-scored.',
                icon: '🔍',
                cta: 'Browse Workers',
                href: '/workers',
              },
              {
                step: '03',
                title: 'Pay by Milestone',
                desc: 'Funds are locked in escrow and released only after each stage is photo-verified. Zero advance. Zero risk.',
                icon: '🔒',
                cta: 'Learn More',
                href: '/estimate',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-lg border border-gray-100 shadow-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-4xl font-bold text-gray-100">{item.step}</span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{item.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-4">{item.desc}</p>
                <Link href={item.href} className="text-sm text-[#E94560] font-medium hover:underline">{item.cta} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B2B SECTION */}
      <section className="bg-[#1A1A2E] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#E94560]/20 border border-[#E94560]/30 rounded-full px-3 py-1 mb-6">
                <span className="text-[#E94560] text-xs font-semibold">For Builders & Interior Firms</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                We are your<br />
                <span className="text-[#E94560]">labor backend.</span>
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Recurring verified labor for bulk projects. SLA-backed. Zero recruitment overhead. 
                One platform to manage all your surface finishing workers across multiple sites.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Dedicated worker pool for your projects',
                  'SLA-backed milestone tracking',
                  'Aggregate spend dashboard',
                  'Priority worker allocation',
                  'Monthly billing & GST invoices',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#10B981] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/estimate/b2b">
                <Button variant="accent" size="lg">Request B2B Partnership</Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Builders', icon: '🏗️' },
                { label: 'Interior Firms', icon: '🛋️' },
                { label: 'Architects', icon: '📐' },
                { label: 'Showrooms', icon: '🏪' },
                { label: 'Facility Mgmt', icon: '🏢' },
                { label: 'Commercial Fitout', icon: '🔨' },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 rounded-lg p-4 text-center border border-white/10">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-white text-sm font-medium mt-2">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORKER BADGE SHOWCASE */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E]">Our Certified ProSlate Partners</h2>
            <p className="text-[#6B7280] mt-2">The best surface finishing specialists in Bengaluru</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_WORKERS.map((worker) => (
              <div key={worker.name} className="bg-white rounded-lg border border-gray-100 shadow-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1A1A2E] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#1A1A2E]">{worker.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${worker.badge === 'Master' ? 'bg-yellow-50 text-yellow-700 border border-yellow-400' : 'bg-red-50 text-[#E94560] border border-[#E94560]'}`}>
                        {worker.badge === 'Master' ? '👑' : '⭐'} {worker.badge}
                      </span>
                    </div>
                  </div>
                  {worker.certified && (
                    <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-400 px-2 py-0.5 rounded-full font-semibold">🏅 Certified</span>
                  )}
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                    <span>Skill Score</span>
                    <span className="font-bold text-[#1A1A2E]">{worker.score}/100</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${worker.score}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center py-3 border-t border-b border-gray-50 mb-3">
                  <div><p className="font-bold text-[#1A1A2E] text-sm">{worker.jobs}</p><p className="text-xs text-[#6B7280]">Jobs</p></div>
                  <div><p className="font-bold text-[#1A1A2E] text-sm">{worker.rating}★</p><p className="text-xs text-[#6B7280]">Rating</p></div>
                  <div><p className="font-bold text-[#1A1A2E] text-sm">{worker.zone}</p><p className="text-xs text-[#6B7280]">Zone</p></div>
                </div>
                <span className="text-xs bg-gray-50 text-[#6B7280] border border-gray-200 px-2 py-0.5 rounded-full">{worker.spec}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/workers">
              <Button variant="outline" size="lg">Browse All Verified Workers <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOR WORKERS CTA */}
      <section className="bg-[#F5F5F0] py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-4xl mb-4 block">👷</span>
          <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">Are you a surface finishing professional?</h2>
          <p className="text-[#6B7280] text-lg mb-8 leading-relaxed">
            Get consistent work, guaranteed milestone payments, and a verified identity that works for you. 
            Build your reputation with every job.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button variant="accent" size="xl">Join as a Worker</Button>
            </Link>
            <Link href="/workers">
              <Button variant="outline" size="xl">See Worker Profiles</Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-12">
            {[
              { icon: '💰', title: 'Guaranteed Payments', desc: 'Milestone escrow — get paid on completion' },
              { icon: '🏅', title: 'Build Your Badge', desc: 'Earn Verified → Expert → Master status' },
              { icon: '📱', title: 'Mobile-First', desc: 'Manage jobs from your phone, anywhere' },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <span className="text-2xl">{item.icon}</span>
                <p className="font-semibold text-[#1A1A2E] text-sm mt-2">{item.title}</p>
                <p className="text-xs text-[#6B7280] mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
