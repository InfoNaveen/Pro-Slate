import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateSPE } from '@/lib/spe';
import { z } from 'zod';

const schema = z.object({
  service_category: z.string(),
  area_sqft: z.number().positive(),
  surface_type: z.enum(['tile_ceramic','tile_gvt','tile_vitrified','marble','granite','epoxy_flooring','waterproofing_membrane','stone_natural']),
  surface_condition: z.enum(['flat','uneven','debris','damaged']),
  complexity: z.enum(['simple','moderate','complex']),
  has_pillars: z.boolean().default(false),
  pillar_count: z.number().int().min(0).default(0),
  has_mitre_cuts: z.boolean().default(false),
  has_epoxy_grouting: z.boolean().default(false),
  floor_count: z.number().int().min(1).default(1),
  site_address: z.string().optional(),
  zone: z.string().optional(),
  notes: z.string().optional(),
  is_b2b: z.boolean().default(false),
  project_name: z.string().optional(),
  expected_start_date: z.string().optional(),
  expected_duration_days: z.number().optional(),
});

const MILESTONE_STAGES = [
  { stage: 1, name: 'Mobilization & Site Prep', payment_pct: 15 },
  { stage: 2, name: 'Base Preparation', payment_pct: 30 },
  { stage: 3, name: 'Installation Complete', payment_pct: 40 },
  { stage: 4, name: 'Final Finishing & Handover', payment_pct: 15 },
];

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || !['homeowner','b2b_client'].includes(profile.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const input = schema.parse(body);
    const speResult = calculateSPE(input);

    const { data: job, error: jobError } = await supabase.from('jobs').insert({
      client_id: session.user.id,
      client_type: profile.role as 'homeowner' | 'b2b_client',
      ...input,
      estimated_cost: speResult.total_cost,
      final_cost: speResult.total_cost,
      quote_breakdown: speResult,
      status: 'pending',
    }).select().single();

    if (jobError || !job) {
      return NextResponse.json({ success: false, error: jobError?.message }, { status: 500 });
    }

    // Auto-create 4 milestones
    const milestones = MILESTONE_STAGES.map((m) => ({
      job_id: job.id,
      stage: m.stage,
      name: m.name,
      payment_pct: m.payment_pct,
      amount: speResult.total_cost * m.payment_pct / 100,
      status: 'pending' as const,
    }));

    await supabase.from('milestones').insert(milestones);

    // Lock escrow
    await supabase.from('escrow_transactions').insert({
      job_id: job.id,
      type: 'lock',
      amount: speResult.total_cost,
      status: 'confirmed',
      mock_tx_hash: '0xPS' + Array.from({ length: 38 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''),
    });

    // Notify admin
    await supabase.from('notifications').insert({
      user_id: session.user.id,
      title: 'Job Created',
      message: `Your job for ${input.service_category} has been created. We are matching you with verified workers.`,
      type: 'job_created',
    });

    return NextResponse.json({ success: true, data: job });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
