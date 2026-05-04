import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMockTxHash, simulateEscrowDelay } from '@/lib/escrow-mock';
import { z } from 'zod';

const schema = z.object({
  job_id: z.string().uuid(),
  milestone_id: z.string().uuid(),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { job_id, milestone_id, amount } = schema.parse(body);

    await simulateEscrowDelay();
    const txHash = generateMockTxHash();

    const { data, error } = await supabase.from('escrow_transactions').insert({
      job_id,
      milestone_id,
      type: 'release',
      amount,
      status: 'confirmed',
      mock_tx_hash: txHash,
    }).select().single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data: { ...data, tx_hash: txHash } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
