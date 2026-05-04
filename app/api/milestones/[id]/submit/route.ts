import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runMockCV } from '@/lib/cv-mock';
import { z } from 'zod';

const schema = z.object({
  photo_urls: z.array(z.string()).min(1).max(4),
  worker_note: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { photo_urls, worker_note } = schema.parse(body);

    const { data: milestone, error: mErr } = await supabase
      .from('milestones')
      .select('*, jobs!inner(worker_id, final_cost, client_id, project_name)')
      .eq('id', params.id)
      .single();

    if (mErr || !milestone) return NextResponse.json({ success: false, error: 'Milestone not found' }, { status: 404 });
    if (milestone.jobs.worker_id !== session.user.id) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    // Run mock CV
    const cvResult = runMockCV(milestone.stage);

    const { data: updated, error: updateErr } = await supabase
      .from('milestones')
      .update({
        photo_urls,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        cv_score: cvResult.cv_score,
        cv_verdict: cvResult.cv_verdict,
        cv_metadata: cvResult.cv_metadata,
        admin_note: worker_note,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateErr) return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });

    // Update job status
    await supabase.from('jobs').update({ status: 'milestone_review' }).eq('id', milestone.job_id);

    // Notify client
    await supabase.from('notifications').insert({
      user_id: milestone.jobs.client_id,
      title: `Stage ${milestone.stage} Submitted`,
      message: `Worker has submitted Stage ${milestone.stage}: ${milestone.name} for review.`,
      type: 'milestone_submitted',
    });

    return NextResponse.json({ success: true, data: updated, cv: cvResult });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
