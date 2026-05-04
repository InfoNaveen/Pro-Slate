'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(3, 'Title required'),
  description: z.string().optional(),
  monthly_rate: z.number().positive().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  sla_terms: z.string().optional(),
  service_categories: z.array(z.string()).min(1, 'Select at least one service'),
});
type FormData = z.infer<typeof schema>;

const SERVICE_OPTIONS = [
  'tile_laying', 'marble_installation', 'epoxy_grouting', 'waterproofing',
  'stone_polishing', 'large_format_tile', 'floor_leveling', 'tile_repair', 'wall_cladding',
];

export default function NewContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { service_categories: [] },
  });

  const toggleService = (s: string) => {
    const updated = selectedServices.includes(s) ? selectedServices.filter((x) => x !== s) : [...selectedServices, s];
    setSelectedServices(updated);
    setValue('service_categories', updated);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/b2b/contracts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      router.push(`/dashboard/b2b/contracts/${json.data.id}`);
    } else {
      setError(json.error ?? 'Failed to create contract');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/b2b/contracts">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">New B2B Contract</h1>
          <p className="text-[#6B7280] text-sm">Set up a recurring labor agreement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
          <h2 className="font-semibold text-[#1A1A2E] mb-4">Contract Details</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-[#1A1A2E]">Contract Title</Label>
              <Input placeholder="Prestige Lakeside — Surface Finishing" className="mt-1" {...register('title')} />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium text-[#1A1A2E]">Description</Label>
              <textarea {...register('description')} placeholder="Describe the scope of work..." className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A2E] h-24 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Monthly Rate (₹)</Label>
                <Input type="number" placeholder="150000" className="mt-1" {...register('monthly_rate', { valueAsNumber: true })} />
              </div>
              <div />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Start Date</Label>
                <Input type="date" className="mt-1" {...register('start_date')} />
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">End Date</Label>
                <Input type="date" className="mt-1" {...register('end_date')} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
          <h2 className="font-semibold text-[#1A1A2E] mb-4">Services Required</h2>
          <div className="flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map((s) => (
              <button type="button" key={s} onClick={() => toggleService(s)}
                className={cn('text-xs px-3 py-1.5 rounded-full border font-medium transition-all', selectedServices.includes(s) ? 'bg-[#E94560] text-white border-[#E94560]' : 'border-gray-200 text-[#6B7280] hover:border-gray-400')}>
                {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
          {errors.service_categories && <p className="text-xs text-red-500 mt-2">{errors.service_categories.message}</p>}
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
          <h2 className="font-semibold text-[#1A1A2E] mb-4">SLA Terms</h2>
          <textarea {...register('sla_terms')} placeholder="e.g. Each milestone must be completed within 3 days of start. Penalty of ₹500/day for delays..." className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A2E] h-28 resize-none" />
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-md p-3"><p className="text-sm text-red-600">{error}</p></div>}

        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Contract'}
        </Button>
      </form>
    </div>
  );
}
