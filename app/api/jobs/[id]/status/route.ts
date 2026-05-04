import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  status: z.enum(['pending','quoted','matched','in_progress','milestone_review','completed','disputed','cancelled']),
  worker_id: z.string().uuid().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { status, worker_id } = schema.parse(body);

    const updateData: Record<string, unknown> = { status };
    if (worker_id) updateData.worker_id = worker_id;

    const { data, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
