import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatDateTime } from '@/lib/utils';
import { Bell } from 'lucide-react';

export default async function WorkerNotificationsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: notifications } = await supabase
    .from('notifications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">Notifications</h1>
      <div className="bg-white rounded-lg shadow-card border border-gray-100">
        {!notifications || notifications.length === 0 ? (
          <div className="p-12 text-center"><Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-[#6B7280]">No notifications</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div key={n.id} className={`p-4 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-[#E94560]' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">{n.title}</p>
                    <p className="text-sm text-[#6B7280] mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
