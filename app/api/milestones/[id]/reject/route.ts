import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({ admin_note: z.string().min(1) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { admin_note } = schema.parse(body);

    const { data: milestone } = await supabase.from('milestones').select('*, jobs!inner(worker_id)').eq('id', params.id).single();
    if (!milestone) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    await supabase.from('milestones').update({ status: 'rejected', admin_note }).eq('id', params.id);
    await supabase.from('jobs').update({ status: 'in_progress' }).eq('id', milestone.job_id);

    await supabase.from('notifications').insert({
      user_id: milestone.jobs.worker_id,
      title: `Stage ${milestone.stage} Rejected`,
      message: `Stage ${milestone.stage} was rejected. Reason: ${admin_note}. Please resubmit with corrections.`,
      type: 'milestone_rejected',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
