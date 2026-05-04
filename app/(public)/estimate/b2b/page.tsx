'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import SPEBreakdownCard from '@/components/spe/SPEBreakdownCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, ZONE_OPTIONS } from '@/lib/utils';
import type { SPEOutput } from '@/types';
import { useRouter } from 'next/navigation';
import { Loader2, Building2, CheckCircle } from 'lucide-react';

const schema = z.object({
  company_name: z.string().min(2),
  project_name: z.string().min(2),
  contact_person: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  area_sqft: z.number().positive(),
  floor_count: z.number().int().min(1),
  zone: z.string().min(1),
  expected_start_date: z.string(),
  sla_required: z.boolean().default(false),
  service_categories: z.array(z.string()).min(1),
});
type FormData = z.infer<typeof schema>;

const SERVICE_OPTIONS = [
  'Tile Laying', 'Marble Installation', 'Epoxy Grouting', 'Waterproofing',
  'Stone Polishing', 'Large Format Tile', 'Floor Leveling', 'Tile Repair', 'Wall Cladding',
];

export default function B2BEstimatePage() {
  const router = useRouter();
  const [result, setResult] = useState<SPEOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { floor_count: 1, sla_required: false, service_categories: [] },
  });

  const toggleService = (s: string) => {
    const updated = selectedServices.includes(s) ? selectedServices.filter((x) => x !== s) : [...selectedServices, s];
    setSelectedServices(updated);
    setValue('service_categories', updated);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const res = await fetch('/api/spe/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area_sqft: data.area_sqft * data.floor_count,
        surface_type: 'tile_vitrified',
        surface_condition: 'flat',
        complexity: 'moderate',
        has_pillars: false,
        pillar_count: 0,
        has_mitre_cuts: false,
        has_epoxy_grouting: false,
      }),
    });
    const json = await res.json();
    if (json.success) setResult(json.data);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F5F0]">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-lg shadow-card p-10">
            <CheckCircle className="h-16 w-16 text-[#10B981] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Request Submitted!</h2>
            <p className="text-[#6B7280] mb-6">Our B2B team will contact you within 24 hours to discuss your project requirements and set up your dedicated worker pool.</p>
            <Button variant="accent" onClick={() => router.push('/auth/signup')}>Create B2B Account</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#1A1A2E] text-white rounded-full px-4 py-1.5 mb-4">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-semibold">B2B Partnership</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A2E]">B2B Labor Estimate</h1>
          <p className="text-[#6B7280] mt-2">For builders, interior firms, architects & facility managers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-5">Project Details</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Company Name</Label>
                  <Input placeholder="Prestige Constructions" className="mt-1" {...register('company_name')} />
                  {errors.company_name && <p className="text-xs text-red-500 mt-1">Required</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Project Name</Label>
                  <Input placeholder="Prestige Lakeside" className="mt-1" {...register('project_name')} />
                  {errors.project_name && <p className="text-xs text-red-500 mt-1">Required</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Contact Person</Label>
                  <Input placeholder="Rahul Sharma" className="mt-1" {...register('contact_person')} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Phone</Label>
                  <Input placeholder="+91 98765 43210" className="mt-1" {...register('phone')} />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Email</Label>
                <Input type="email" placeholder="rahul@prestige.com" className="mt-1" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500 mt-1">Valid email required</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Area per Floor (sqft)</Label>
                  <Input type="number" placeholder="2000" className="mt-1" {...register('area_sqft', { valueAsNumber: true })} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Number of Floors</Label>
                  <Input type="number" min="1" placeholder="5" className="mt-1" {...register('floor_count', { valueAsNumber: true })} />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E] block mb-2">Zone</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ZONE_OPTIONS.slice(0, 6).map((z) => (
                    <button type="button" key={z} onClick={() => setValue('zone', z)}
                      className={cn('p-2 border rounded-md text-xs font-medium transition-all', watch('zone') === z ? 'border-[#E94560] bg-red-50 text-[#E94560]' : 'border-gray-200 text-[#6B7280]')}>
                      {z}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E] block mb-2">Services Required</Label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map((s) => (
                    <button type="button" key={s} onClick={() => toggleService(s)}
                      className={cn('text-xs px-2.5 py-1 rounded-full border font-medium transition-all', selectedServices.includes(s) ? 'bg-[#E94560] text-white border-[#E94560]' : 'border-gray-200 text-[#6B7280] hover:border-gray-400')}>
                      {s}
                    </button>
                  ))}
                </div>
                {errors.service_categories && <p className="text-xs text-red-500 mt-1">Select at least one service</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Expected Start Date</Label>
                <Input type="date" className="mt-1" {...register('expected_start_date')} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('sla_required')} className="w-4 h-4 accent-[#E94560]" />
                <div>
                  <p className="text-sm font-medium text-[#1A1A2E]">SLA Required</p>
                  <p className="text-xs text-[#6B7280]">Guaranteed completion timelines with penalty clauses</p>
                </div>
              </label>
              <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Calculating...</> : 'Calculate B2B Estimate'}
              </Button>
            </form>
          </div>

          <div>
            {result ? (
              <div>
                <SPEBreakdownCard result={result} onContinue={() => setSubmitted(true)} />
                <div className="mt-4 bg-[#1A1A2E] rounded-lg p-4 text-white">
                  <p className="text-sm font-semibold mb-2">B2B Partnership Includes:</p>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>✓ Dedicated verified worker pool</li>
                    <li>✓ SLA-backed milestone tracking</li>
                    <li>✓ Monthly billing & GST invoices</li>
                    <li>✓ Priority worker allocation</li>
                    <li>✓ Dedicated account manager</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6 h-full flex flex-col justify-center items-center text-center">
                <span className="text-5xl mb-4">📊</span>
                <h3 className="font-bold text-[#1A1A2E] mb-2">Your estimate will appear here</h3>
                <p className="text-sm text-[#6B7280]">Fill in the project details and click Calculate to get an instant cost breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
