import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const ids: string[] = body.ids ?? [];

    if (ids.length > 0) {
      await supabase.from('notifications').update({ read: true }).in('id', ids).eq('user_id', session.user.id);
    } else {
      await supabase.from('notifications').update({ read: true }).eq('user_id', session.user.id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
