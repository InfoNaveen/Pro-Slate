import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const [
      { count: totalJobs },
      { count: activeJobs },
      { count: completedJobs },
      { count: totalWorkers },
      { count: certifiedWorkers },
      { count: pendingMilestones },
      { count: openDisputes },
      { count: totalContracts },
      { count: activeContracts },
      { data: escrowData },
    ] = await Promise.all([
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('worker_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('worker_profiles').select('*', { count: 'exact', head: true }).eq('certified', true),
      supabase.from('milestones').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
      supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('b2b_contracts').select('*', { count: 'exact', head: true }),
      supabase.from('b2b_contracts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('escrow_transactions').select('amount').eq('type', 'release').eq('status', 'confirmed'),
    ]);

    const totalEscrowReleased = escrowData?.reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        total_jobs: totalJobs ?? 0,
        active_jobs: activeJobs ?? 0,
        completed_jobs: completedJobs ?? 0,
        total_workers: totalWorkers ?? 0,
        certified_workers: certifiedWorkers ?? 0,
        pending_milestones: pendingMilestones ?? 0,
        open_disputes: openDisputes ?? 0,
        total_escrow_released: totalEscrowReleased,
        total_b2b_contracts: totalContracts ?? 0,
        active_b2b_contracts: activeContracts ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
