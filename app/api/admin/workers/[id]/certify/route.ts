import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isCertifiedPartner } from '@/lib/skill-matrix';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { data: worker } = await supabase.from('worker_profiles').select('*').eq('id', params.id).single();
    if (!worker) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const eligible = isCertifiedPartner(worker);
    if (!eligible) return NextResponse.json({ success: false, error: 'Worker does not meet certification criteria' }, { status: 400 });

    await supabase.from('worker_profiles').update({ certified: true }).eq('id', params.id);

    await supabase.from('notifications').insert({
      user_id: params.id,
      title: '🏅 ProSlate Certified!',
      message: 'Congratulations! You have been awarded the ProSlate Certified Partner badge. You now get priority ranking in search results.',
      type: 'certification',
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
