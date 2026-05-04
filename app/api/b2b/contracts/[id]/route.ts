import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('b2b_contracts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const { data: jobs } = await supabase.from('jobs').select('*').eq('is_b2b', true).eq('client_id', data.client_id);

    return NextResponse.json({ success: true, data: { ...data, jobs: jobs ?? [] } });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
