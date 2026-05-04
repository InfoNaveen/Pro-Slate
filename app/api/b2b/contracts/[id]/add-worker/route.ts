import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({ worker_id: z.string().uuid() });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { worker_id } = schema.parse(body);

    const { data: contract } = await supabase.from('b2b_contracts').select('worker_ids').eq('id', params.id).single();
    if (!contract) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const existing = contract.worker_ids ?? [];
    if (existing.includes(worker_id)) return NextResponse.json({ success: false, error: 'Worker already in contract' }, { status: 400 });

    const { data, error } = await supabase.from('b2b_contracts').update({ worker_ids: [...existing, worker_id] }).eq('id', params.id).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
