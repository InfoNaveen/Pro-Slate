'use client';
import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import SPEBreakdownCard from '@/components/spe/SPEBreakdownCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, ZONE_OPTIONS } from '@/lib/utils';
import type { SPEOutput, SurfaceType, SurfaceCondition, Complexity } from '@/types';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const STEPS = ['Project Type', 'Service', 'Surface', 'Area & Zone', 'Details', 'Results'];

const SERVICE_CATEGORIES = [
  { name: 'Tile Laying', slug: 'tile_laying', icon: '🪟', surface: 'tile_ceramic' },
  { name: 'Marble Installation', slug: 'marble_installation', icon: '💎', surface: 'marble' },
  { name: 'Epoxy Grouting', slug: 'epoxy_grouting', icon: '🔵', surface: 'epoxy_flooring' },
  { name: 'Waterproofing', slug: 'waterproofing', icon: '💧', surface: 'waterproofing_membrane' },
  { name: 'Stone Polishing', slug: 'stone_polishing', icon: '✨', surface: 'stone_natural' },
  { name: 'Large Format Tile', slug: 'large_format_tile', icon: '⬛', surface: 'tile_vitrified' },
  { name: 'Floor Leveling', slug: 'floor_leveling', icon: '📐', surface: 'tile_gvt' },
  { name: 'Tile Repair', slug: 'tile_repair', icon: '🔧', surface: 'tile_ceramic' },
  { name: 'Wall Cladding', slug: 'wall_cladding', icon: '🧱', surface: 'tile_vitrified' },
];

const SURFACE_TYPES: { value: SurfaceType; label: string; rate: string }[] = [
  { value: 'tile_ceramic', label: 'Ceramic Tile', rate: '₹55/sqft' },
  { value: 'tile_gvt', label: 'GVT Tile', rate: '₹85/sqft' },
  { value: 'tile_vitrified', label: 'Vitrified Tile', rate: '₹120/sqft' },
  { value: 'marble', label: 'Marble', rate: '₹180/sqft' },
  { value: 'granite', label: 'Granite', rate: '₹160/sqft' },
  { value: 'epoxy_flooring', label: 'Epoxy Flooring', rate: '₹200/sqft' },
  { value: 'waterproofing_membrane', label: 'Waterproofing Membrane', rate: '₹90/sqft' },
  { value: 'stone_natural', label: 'Natural Stone', rate: '₹220/sqft' },
];

export default function EstimatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SPEOutput | null>(null);

  const [form, setForm] = useState({
    client_type: 'homeowner' as 'homeowner' | 'b2b_client',
    service_category: '',
    surface_type: 'tile_ceramic' as SurfaceType,
    area_sqft: '',
    zone: '',
    surface_condition: 'flat' as SurfaceCondition,
    complexity: 'simple' as Complexity,
    has_pillars: false,
    pillar_count: 0,
    has_mitre_cuts: false,
    has_epoxy_grouting: false,
  });

  const update = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const calculate = async () => {
    setLoading(true);
    const res = await fetch('/api/spe/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area_sqft: parseFloat(form.area_sqft),
        surface_type: form.surface_type,
        surface_condition: form.surface_condition,
        complexity: form.complexity,
        has_pillars: form.has_pillars,
        pillar_count: form.pillar_count,
        has_mitre_cuts: form.has_mitre_cuts,
        has_epoxy_grouting: form.has_epoxy_grouting,
      }),
    });
    const data = await res.json();
    if (data.success) setResult(data.data);
    setLoading(false);
    setStep(5);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A2E]">Get Free Estimate</h1>
          <p className="text-[#6B7280] mt-1">Instant cost breakdown for your surface finishing project</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all', i < step ? 'bg-[#10B981] text-white' : i === step ? 'bg-[#E94560] text-white' : 'bg-gray-200 text-gray-500')}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={cn('h-0.5 w-6 sm:w-10 mx-1', i < step ? 'bg-[#10B981]' : 'bg-gray-200')} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6">
          {/* Step 0: Client type */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">This estimate is for...</h2>
              <div className="space-y-3">
                {[
                  { value: 'homeowner', label: 'My Home', desc: 'Residential project', icon: '🏠' },
                  { value: 'b2b_client', label: 'My Business Project', desc: 'Commercial / bulk project', icon: '🏢' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { update('client_type', opt.value); setStep(1); }}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#E94560] hover:bg-red-50 transition-all text-left"
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-semibold text-[#1A1A2E]">{opt.label}</p>
                      <p className="text-xs text-[#6B7280]">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Service category */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">Select service type</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => { update('service_category', cat.slug); update('surface_type', cat.surface as SurfaceType); setStep(2); }}
                    className={cn('p-4 border-2 rounded-lg text-center hover:border-[#E94560] hover:bg-red-50 transition-all', form.service_category === cat.slug ? 'border-[#E94560] bg-red-50' : 'border-gray-200')}
                  >
                    <span className="text-2xl block mb-1">{cat.icon}</span>
                    <span className="text-xs font-medium text-[#1A1A2E]">{cat.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(0)} className="mt-4 text-sm text-[#6B7280] hover:text-[#1A1A2E]">← Back</button>
            </div>
          )}

          {/* Step 2: Surface type */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">Select surface material</h2>
              <div className="space-y-2">
                {SURFACE_TYPES.map((st) => (
                  <button
                    key={st.value}
                    onClick={() => { update('surface_type', st.value); setStep(3); }}
                    className={cn('w-full flex items-center justify-between p-3 border-2 rounded-lg hover:border-[#E94560] transition-all', form.surface_type === st.value ? 'border-[#E94560] bg-red-50' : 'border-gray-200')}
                  >
                    <span className="text-sm font-medium text-[#1A1A2E]">{st.label}</span>
                    <span className="text-xs text-[#E94560] font-semibold">{st.rate}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="mt-4 text-sm text-[#6B7280] hover:text-[#1A1A2E]">← Back</button>
            </div>
          )}

          {/* Step 3: Area + Zone */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">Project area & location</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Total Area (sq ft)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={form.area_sqft}
                    onChange={(e) => update('area_sqft', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Zone in Bengaluru</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ZONE_OPTIONS.map((z) => (
                      <button
                        key={z}
                        onClick={() => update('zone', z)}
                        className={cn('p-2 border rounded-md text-xs font-medium transition-all', form.zone === z ? 'border-[#E94560] bg-red-50 text-[#E94560]' : 'border-gray-200 text-[#6B7280] hover:border-gray-400')}
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="text-sm text-[#6B7280] hover:text-[#1A1A2E]">← Back</button>
                <Button variant="accent" onClick={() => setStep(4)} disabled={!form.area_sqft || parseFloat(form.area_sqft) <= 0} className="flex-1">Continue →</Button>
              </div>
            </div>
          )}

          {/* Step 4: Condition + complexity + add-ons */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">Site conditions & add-ons</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-2">Surface Condition</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'flat', label: 'Flat', desc: '+₹0/sqft' },
                      { value: 'uneven', label: 'Uneven', desc: '+₹25/sqft' },
                      { value: 'debris', label: 'Has Debris', desc: '+₹45/sqft' },
                      { value: 'damaged', label: 'Damaged', desc: '+₹70/sqft' },
                    ].map((opt) => (
                      <button key={opt.value} onClick={() => update('surface_condition', opt.value)}
                        className={cn('p-3 border-2 rounded-lg text-left transition-all', form.surface_condition === opt.value ? 'border-[#E94560] bg-red-50' : 'border-gray-200 hover:border-gray-400')}>
                        <p className="text-sm font-medium text-[#1A1A2E]">{opt.label}</p>
                        <p className="text-xs text-[#6B7280]">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1A1A2E] block mb-2">Complexity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'simple', label: 'Simple', desc: '+₹15/sqft' },
                      { value: 'moderate', label: 'Moderate', desc: '+₹35/sqft' },
                      { value: 'complex', label: 'Complex', desc: '+₹60/sqft' },
                    ].map((opt) => (
                      <button key={opt.value} onClick={() => update('complexity', opt.value)}
                        className={cn('p-3 border-2 rounded-lg text-center transition-all', form.complexity === opt.value ? 'border-[#E94560] bg-red-50' : 'border-gray-200 hover:border-gray-400')}>
                        <p className="text-sm font-medium text-[#1A1A2E]">{opt.label}</p>
                        <p className="text-xs text-[#6B7280]">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[#1A1A2E] block">Add-ons</label>
                  {[
                    { key: 'has_pillars', label: 'Has Pillars', desc: '₹1,200 per pillar' },
                    { key: 'has_mitre_cuts', label: 'Mitre Cuts Required', desc: '+₹1,800 flat' },
                    { key: 'has_epoxy_grouting', label: 'Epoxy Grouting', desc: '+₹40/sqft' },
                  ].map((addon) => (
                    <label key={addon.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-[#1A1A2E]">{addon.label}</p>
                        <p className="text-xs text-[#6B7280]">{addon.desc}</p>
                      </div>
                      <input type="checkbox" checked={form[addon.key as keyof typeof form] as boolean}
                        onChange={(e) => update(addon.key, e.target.checked)}
                        className="w-4 h-4 accent-[#E94560]" />
                    </label>
                  ))}
                  {form.has_pillars && (
                    <div>
                      <label className="text-sm font-medium text-[#1A1A2E] block mb-1">Number of Pillars</label>
                      <Input type="number" min="1" value={form.pillar_count} onChange={(e) => update('pillar_count', parseInt(e.target.value) || 0)} />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)} className="text-sm text-[#6B7280] hover:text-[#1A1A2E]">← Back</button>
                <Button variant="accent" onClick={calculate} disabled={loading} className="flex-1">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Calculating...</> : 'Calculate Estimate →'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {step === 5 && result && (
            <div>
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">Your Estimate</h2>
              <SPEBreakdownCard
                result={result}
                onContinue={() => router.push('/auth/signup')}
              />
              <button onClick={() => { setStep(0); setResult(null); }} className="mt-4 text-sm text-[#6B7280] hover:text-[#1A1A2E] w-full text-center">
                ← Start over
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
