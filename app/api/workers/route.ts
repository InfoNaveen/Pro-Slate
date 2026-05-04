import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(req.url);

    let query = supabase
      .from('worker_profiles')
      .select('*, profiles!inner(id, full_name, avatar_url, city)')
      .order('skill_score', { ascending: false });

    const badge = searchParams.get('badge');
    if (badge) query = query.eq('badge', badge);

    const zone = searchParams.get('zone');
    if (zone) query = query.eq('current_zone', zone);

    const available = searchParams.get('available');
    if (available === 'true') query = query.eq('available', true);

    const certified = searchParams.get('certified');
    if (certified === 'true') query = query.eq('certified', true);

    const minRating = searchParams.get('min_rating');
    if (minRating) query = query.gte('avg_rating', parseFloat(minRating));

    const spec = searchParams.get('specialization');
    if (spec) query = query.contains('specializations', [spec]);

    const sort = searchParams.get('sort') ?? 'skill_score';
    const validSorts = ['skill_score', 'avg_rating', 'total_jobs', 'daily_rate'];
    if (validSorts.includes(sort)) {
      query = query.order(sort, { ascending: false });
    }

    const limit = parseInt(searchParams.get('limit') ?? '20');
    const offset = parseInt(searchParams.get('offset') ?? '0');
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data, count });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
