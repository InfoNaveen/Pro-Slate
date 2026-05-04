import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  job_id: z.string().uuid(),
  worker_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  quality_rating: z.number().int().min(1).max(5),
  punctuality_rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const input = schema.parse(body);

    const { data, error } = await supabase.from('reviews').insert({
      ...input,
      reviewer_id: session.user.id,
    }).select().single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Update worker avg_rating
    const { data: allReviews } = await supabase.from('reviews').select('rating').eq('worker_id', input.worker_id);
    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await supabase.from('worker_profiles').update({ avg_rating: Math.round(avg * 10) / 10 }).eq('id', input.worker_id);
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
