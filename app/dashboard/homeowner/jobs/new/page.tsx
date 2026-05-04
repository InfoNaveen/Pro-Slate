'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SPEBreakdownCard from '@/components/spe/SPEBreakdownCard';
import { cn, ZONE_OPTIONS } from '@/lib/utils';
import type { SPEOutput, SurfaceType, SurfaceCondition, Complexity } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  service_category: z.string().min(1),
  surface_type: z.enum(['tile_ceramic','tile_gvt','tile_vitrified','marble','granite','epoxy_flooring','waterproofing_membrane','stone_natural']),
  area_sqft: z.number().positive(),
  surface_condition: z.enum(['flat','uneven','debris','damaged']),
  complexity: z.enum(['simple','moderate','complex']),
  has_pillars: z.boolean(),
  pillar_count: z.number().int().min(0),
  has_mitre_cuts: z.boolean(),
  has_epoxy_grouting: z.boolean(),
  floor_count: z.number().int().min(1),
  site_address: z.string().optional(),
  zone: z.string().min(1, 'Select a zone'),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const SERVICE_CATEGORIES = [
  { slug: 'tile_laying', name: 'Tile Laying', icon: '🪟' },
  { slug: 'marble_installation', name: 'Marble Installation', icon: '💎' },
  { slug: 'epoxy_grouting', name: 'Epoxy Grouting', icon: '🔵' },
  { slug: 'waterproofing', name: 'Waterproofing', icon: '💧' },
  { slug: 'stone_polishing', name: 'Stone Polishing', icon: '✨' },
  { slug: 'large_format_tile', name: 'Large Format Tile', icon: '⬛' },
  { slug: 'floor_leveling', name: 'Floor Leveling', icon: '📐' },
  { slug: 'tile_repair', name: 'Tile Repair', icon: '🔧' },
  { slug: 'wall_cladding', name: 'Wall Cladding', icon: '🧱' },
];

export default function NewJobPage() {
  const router = useRouter();
  const [estimate, setEstimate] = useState<SPEOutput | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      surface_type: 'tile_ceramic',
      surface_condition: 'flat',
      complexity: 'simple',
      has_pillars: false,
      pillar_count: 0,
      has_mitre_cuts: false,
      has_epoxy_grouting: false,
      floor_count: 1,
    },
  });

  const watchedValues = watch();

  const getEstimate = async () => {
    setEstimating(true);
    const res = await fetch('/api/spe/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area_sqft: watchedValues.area_sqft,
        surface_type: watchedValues.surface_type,
        surface_condition: watchedValues.surface_condition,
        complexity: watchedValues.complexity,
        has_pillars: watchedValues.has_pillars,
        pillar_count: watchedValues.pillar_count,
        has_mitre_cuts: watchedValues.has_mitre_cuts,
        has_epoxy_grouting: watchedValues.has_epoxy_grouting,
      }),
    });
    const data = await res.json();
    if (data.success) setEstimate(data.data);
    setEstimating(false);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    const res = await fetch('/api/jobs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      router.push(`/dashboard/homeowner/jobs/${json.data.id}`);
    } else {
      setError(json.error ?? 'Failed to create job');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/homeowner/jobs">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Book a New Job</h1>
          <p className="text-[#6B7280] text-sm">Fill in your project details to get matched with verified workers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Service Category */}
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1A1A2E] mb-4">Service Type</h2>
            <div className="grid grid-cols-3 gap-2">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setValue('service_category', cat.slug)}
                  className={cn('p-3 border-2 rounded-lg text-center transition-all', watchedValues.service_category === cat.slug ? 'border-[#E94560] bg-red-50' : 'border-gray-200 hover:border-gray-400')}
                >
                  <span className="text-xl block mb-1">{cat.icon}</span>
                  <span className="text-xs font-medium text-[#1A1A2E]">{cat.name}</span>
                </button>
              ))}
            </div>
            {errors.service_category && <p className="text-xs text-red-500 mt-2">Select a service type</p>}
          </div>

          {/* Surface & Area */}
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1A1A2E] mb-4">Surface Details</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Surface Type</Label>
                <select {...register('surface_type')} className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A2E]">
                  <option value="tile_ceramic">Ceramic Tile — ₹55/sqft</option>
                  <option value="tile_gvt">GVT Tile — ₹85/sqft</option>
                  <option value="tile_vitrified">Vitrified Tile — ₹120/sqft</option>
                  <option value="marble">Marble — ₹180/sqft</option>
                  <option value="granite">Granite — ₹160/sqft</option>
                  <option value="epoxy_flooring">Epoxy Flooring — ₹200/sqft</option>
                  <option value="waterproofing_membrane">Waterproofing Membrane — ₹90/sqft</option>
                  <option value="stone_natural">Natural Stone — ₹220/sqft</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Area (sq ft)</Label>
                  <Input type="number" placeholder="500" className="mt-1" {...register('area_sqft', { valueAsNumber: true })} />
                  {errors.area_sqft && <p className="text-xs text-red-500 mt-1">Enter valid area</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Floors</Label>
                  <Input type="number" min="1" placeholder="1" className="mt-1" {...register('floor_count', { valueAsNumber: true })} />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E] block mb-2">Surface Condition</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 'flat', l: 'Flat' }, { v: 'uneven', l: 'Uneven' }, { v: 'debris', l: 'Has Debris' }, { v: 'damaged', l: 'Damaged' }].map((o) => (
                    <button key={o.v} type="button" onClick={() => setValue('surface_condition', o.v as SurfaceCondition)}
                      className={cn('p-2 border-2 rounded-lg text-sm font-medium transition-all', watchedValues.surface_condition === o.v ? 'border-[#E94560] bg-red-50 text-[#E94560]' : 'border-gray-200 text-[#6B7280]')}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E] block mb-2">Complexity</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: 'simple', l: 'Simple' }, { v: 'moderate', l: 'Moderate' }, { v: 'complex', l: 'Complex' }].map((o) => (
                    <button key={o.v} type="button" onClick={() => setValue('complexity', o.v as Complexity)}
                      className={cn('p-2 border-2 rounded-lg text-sm font-medium transition-all', watchedValues.complexity === o.v ? 'border-[#E94560] bg-red-50 text-[#E94560]' : 'border-gray-200 text-[#6B7280]')}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1A1A2E] mb-4">Add-ons</h2>
            <div className="space-y-3">
              {[
                { key: 'has_pillars', label: 'Has Pillars', desc: '₹1,200 per pillar' },
                { key: 'has_mitre_cuts', label: 'Mitre Cuts', desc: '+₹1,800 flat' },
                { key: 'has_epoxy_grouting', label: 'Epoxy Grouting', desc: '+₹40/sqft' },
              ].map((addon) => (
                <label key={addon.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A2E]">{addon.label}</p>
                    <p className="text-xs text-[#6B7280]">{addon.desc}</p>
                  </div>
                  <input type="checkbox" {...register(addon.key as keyof FormData)} className="w-4 h-4 accent-[#E94560]" />
                </label>
              ))}
              {watchedValues.has_pillars && (
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Number of Pillars</Label>
                  <Input type="number" min="1" className="mt-1" {...register('pillar_count', { valueAsNumber: true })} />
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1A1A2E] mb-4">Site Location</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E] block mb-2">Zone</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ZONE_OPTIONS.map((z) => (
                    <button key={z} type="button" onClick={() => setValue('zone', z)}
                      className={cn('p-2 border rounded-md text-xs font-medium transition-all', watchedValues.zone === z ? 'border-[#E94560] bg-red-50 text-[#E94560]' : 'border-gray-200 text-[#6B7280]')}>
                      {z}
                    </button>
                  ))}
                </div>
                {errors.zone && <p className="text-xs text-red-500 mt-1">Select a zone</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Site Address</Label>
                <Input placeholder="Flat 4B, Prestige Lakeside..." className="mt-1" {...register('site_address')} />
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Notes (optional)</Label>
                <textarea {...register('notes')} placeholder="Any special requirements..." className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A2E] h-20 resize-none" />
              </div>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-md p-3"><p className="text-sm text-red-600">{error}</p></div>}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={getEstimate} disabled={estimating || !watchedValues.area_sqft}>
              {estimating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Calculating...</> : 'Preview Estimate'}
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Booking...</> : 'Book Job & Lock Escrow'}
            </Button>
          </div>
        </form>

        {/* Estimate preview */}
        <div>
          {estimate ? (
            <div className="sticky top-24">
              <h2 className="font-semibold text-[#1A1A2E] mb-3">Cost Estimate</h2>
              <SPEBreakdownCard result={estimate} />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-card border border-gray-100 p-8 text-center sticky top-24">
              <span className="text-4xl">📊</span>
              <p className="text-[#6B7280] mt-3 text-sm">Fill in the details and click "Preview Estimate" to see the cost breakdown</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
