import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();

    const { data: worker, error } = await supabase
      .from('worker_profiles')
      .select('*, profiles!inner(id, full_name, avatar_url, city, phone)')
      .eq('id', params.id)
      .single();

    if (error || !worker) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, profiles!reviews_reviewer_id_fkey(full_name)')
      .eq('worker_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({ success: true, data: { ...worker, reviews: reviews ?? [] } });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
