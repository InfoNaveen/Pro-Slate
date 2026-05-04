'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BadgeChip from '@/components/workers/BadgeChip';
import CertifiedBadge from '@/components/workers/CertifiedBadge';
import SkillScoreBar from '@/components/workers/SkillScoreBar';
import { cn, ZONE_OPTIONS, SPECIALIZATION_LABELS } from '@/lib/utils';
import { Loader2, Save } from 'lucide-react';
import type { BadgeTier, Specialization } from '@/types';

const schema = z.object({
  full_name: z.string().min(2),
  phone: z.string().optional(),
  bio: z.string().optional(),
  daily_rate: z.number().positive().optional(),
  experience_years: z.number().int().min(0),
  current_zone: z.string().optional(),
  available: z.boolean(),
});
type FormData = z.infer<typeof schema>;

const ALL_SPECS = Object.keys(SPECIALIZATION_LABELS) as Specialization[];

export default function WorkerProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [worker, setWorker] = useState<{ badge: BadgeTier; skill_score: number; certified: boolean; specializations: string[] } | null>(null);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { available: true, experience_years: 0 },
  });

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      const { data: wp } = await supabase.from('worker_profiles').select('*').eq('id', session.user.id).single();
      if (profile && wp) {
        reset({
          full_name: profile.full_name,
          phone: profile.phone ?? '',
          bio: wp.bio ?? '',
          daily_rate: wp.daily_rate ?? undefined,
          experience_years: wp.experience_years,
          current_zone: wp.current_zone ?? '',
          available: wp.available,
        });
        setWorker({ badge: wp.badge as BadgeTier, skill_score: wp.skill_score, certified: wp.certified, specializations: wp.specializations });
        setSelectedSpecs(wp.specializations ?? []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const toggleSpec = (s: string) => {
    setSelectedSpecs((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('profiles').update({ full_name: data.full_name, phone: data.phone }).eq('id', session.user.id);
    await supabase.from('worker_profiles').update({
      bio: data.bio,
      daily_rate: data.daily_rate,
      experience_years: data.experience_years,
      current_zone: data.current_zone,
      available: data.available,
      specializations: selectedSpecs,
    }).eq('id', session.user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#E94560]" /></div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">My Profile</h1>
          <p className="text-[#6B7280] text-sm">Update your professional profile</p>
        </div>
        {worker && (
          <div className="flex items-center gap-2">
            <BadgeChip badge={worker.badge} />
            {worker.certified && <CertifiedBadge />}
          </div>
        )}
      </div>

      {worker && (
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5 mb-5">
          <SkillScoreBar score={worker.skill_score} badge={worker.badge} label="Your Skill Score" showTiers />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
          <h2 className="font-semibold text-[#1A1A2E] mb-4">Personal Info</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-[#1A1A2E]">Full Name</Label>
              <Input className="mt-1" {...register('full_name')} />
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium text-[#1A1A2E]">Phone</Label>
              <Input className="mt-1" {...register('phone')} />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#1A1A2E]">Bio</Label>
              <textarea {...register('bio')} placeholder="Describe your experience and expertise..." className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A2E] h-24 resize-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
          <h2 className="font-semibold text-[#1A1A2E] mb-4">Work Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Daily Rate (₹)</Label>
                <Input type="number" className="mt-1" {...register('daily_rate', { valueAsNumber: true })} />
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Experience (years)</Label>
                <Input type="number" min="0" className="mt-1" {...register('experience_years', { valueAsNumber: true })} />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-[#1A1A2E] block mb-2">Zone</Label>
              <div className="grid grid-cols-3 gap-2">
                {ZONE_OPTIONS.map((z) => (
                  <button key={z} type="button" onClick={() => setValue('current_zone', z)}
                    className={cn('p-2 border rounded-md text-xs font-medium transition-all', watch('current_zone') === z ? 'border-[#E94560] bg-red-50 text-[#E94560]' : 'border-gray-200 text-[#6B7280]')}>
                    {z}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('available')} className="w-4 h-4 accent-[#E94560]" />
              <div>
                <p className="text-sm font-medium text-[#1A1A2E]">Available for work</p>
                <p className="text-xs text-[#6B7280]">Toggle off when you're on a job</p>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-5">
          <h2 className="font-semibold text-[#1A1A2E] mb-4">Specializations</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SPECS.map((spec) => (
              <button key={spec} type="button" onClick={() => toggleSpec(spec)}
                className={cn('text-xs px-2.5 py-1 rounded-full border font-medium transition-all', selectedSpecs.includes(spec) ? 'bg-[#E94560] text-white border-[#E94560]' : 'border-gray-200 text-[#6B7280] hover:border-gray-400')}>
                {SPECIALIZATION_LABELS[spec]}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : saved ? <><Save className="h-4 w-4 mr-2" />Saved!</> : <><Save className="h-4 w-4 mr-2" />Save Profile</>}
        </Button>
      </form>
    </div>
  );
}
