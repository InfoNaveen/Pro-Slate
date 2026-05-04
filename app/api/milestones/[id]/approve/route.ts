import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMockTxHash, simulateEscrowDelay } from '@/lib/escrow-mock';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const adminNote = body.admin_note ?? '';

    const { data: milestone, error: mErr } = await supabase
      .from('milestones')
      .select('*, jobs!inner(final_cost, worker_id, client_id, project_name)')
      .eq('id', params.id)
      .single();

    if (mErr || !milestone) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    // Approve milestone
    await supabase.from('milestones').update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: session.user.id,
      admin_note: adminNote || milestone.admin_note,
    }).eq('id', params.id);

    // Simulate escrow delay
    await simulateEscrowDelay();

    const amount = milestone.jobs.final_cost * milestone.payment_pct / 100;
    const txHash = generateMockTxHash();

    // Release escrow
    await supabase.from('escrow_transactions').insert({
      job_id: milestone.job_id,
      milestone_id: milestone.id,
      type: 'release',
      amount,
      status: 'confirmed',
      mock_tx_hash: txHash,
    });

    // Mark milestone paid
    await supabase.from('milestones').update({ status: 'paid' }).eq('id', params.id);

    // Check if all milestones paid → complete job
    const { data: allMilestones } = await supabase
      .from('milestones')
      .select('status')
      .eq('job_id', milestone.job_id);

    const allPaid = allMilestones?.every((m) => m.status === 'paid');
    if (allPaid) {
      await supabase.from('jobs').update({ status: 'completed' }).eq('id', milestone.job_id);
    } else {
      await supabase.from('jobs').update({ status: 'in_progress' }).eq('id', milestone.job_id);
    }

    // Notify worker
    const projectName = milestone.jobs.project_name ?? 'your project';
    await supabase.from('notifications').insert({
      user_id: milestone.jobs.worker_id,
      title: `Payment Released — Stage ${milestone.stage}`,
      message: `₹${amount.toLocaleString('en-IN')} released for Stage ${milestone.stage} of ${projectName}. TX: ${txHash.slice(0, 16)}...`,
      type: 'payment_released',
    });

    return NextResponse.json({ success: true, data: { amount, tx_hash: txHash } });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
