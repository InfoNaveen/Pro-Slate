import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  service_categories: z.array(z.string()),
  monthly_rate: z.number().positive().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  sla_terms: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'b2b_client') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const input = schema.parse(body);

    const { data, error } = await supabase.from('b2b_contracts').insert({
      ...input,
      client_id: session.user.id,
      status: 'draft',
      worker_ids: [],
    }).select().single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
