import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  status: z.enum(['approved','rejected']),
  notes: z.string().optional(),
  verification_type: z.string().default('identity'),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { status, notes, verification_type } = schema.parse(body);

    await supabase.from('worker_verifications').insert({
      worker_id: params.id,
      verification_type,
      status,
      notes,
      verified_by: session.user.id,
    });

    if (status === 'approved') {
      await supabase.from('worker_profiles').update({ verified_at: new Date().toISOString() }).eq('id', params.id);
    }

    await supabase.from('notifications').insert({
      user_id: params.id,
      title: status === 'approved' ? 'Verification Approved' : 'Verification Rejected',
      message: status === 'approved'
        ? 'Your identity verification has been approved. Your profile is now verified.'
        : `Your verification was rejected. Reason: ${notes ?? 'Please resubmit documents.'}`,
      type: 'verification_update',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
