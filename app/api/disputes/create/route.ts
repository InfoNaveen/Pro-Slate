import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  job_id: z.string().uuid(),
  reason: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { job_id, reason } = schema.parse(body);

    const { data, error } = await supabase.from('disputes').insert({
      job_id,
      raised_by: session.user.id,
      reason,
      status: 'open',
    }).select().single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    await supabase.from('jobs').update({ status: 'disputed' }).eq('id', job_id);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
