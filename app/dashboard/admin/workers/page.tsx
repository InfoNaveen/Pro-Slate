import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BadgeChip from '@/components/workers/BadgeChip';
import CertifiedBadge from '@/components/workers/CertifiedBadge';
import SkillScoreBar from '@/components/workers/SkillScoreBar';
import { formatINR } from '@/lib/utils';
import type { BadgeTier } from '@/types';

export default async function AdminWorkersPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: workers } = await supabase
    .from('worker_profiles')
    .select('*, profiles!inner(id, full_name, phone, city)')
    .order('skill_score', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">All Workers ({workers?.length ?? 0})</h1>
      <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Worker</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Badge</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Skill Score</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Jobs</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Rating</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Zone</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Rate</th>
              <th className="text-left p-4 font-semibold text-[#6B7280]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(workers ?? []).map((w) => (
              <tr key={w.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#1A1A2E] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {w.profiles.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A2E]">{w.profiles.full_name}</p>
                      {w.certified && <CertifiedBadge size="sm" />}
                    </div>
                  </div>
                </td>
                <td className="p-4"><BadgeChip badge={w.badge as BadgeTier} size="sm" /></td>
                <td className="p-4 w-32">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1A1A2E] rounded-full" style={{ width: `${w.skill_score}%` }} />
                    </div>
                    <span className="text-xs font-medium text-[#1A1A2E]">{w.skill_score}</span>
                  </div>
                </td>
                <td className="p-4 text-[#6B7280]">{w.total_jobs}</td>
                <td className="p-4 text-[#6B7280]">{w.avg_rating.toFixed(1)}★</td>
                <td className="p-4 text-[#6B7280]">{w.current_zone ?? '—'}</td>
                <td className="p-4 text-[#6B7280]">{w.daily_rate ? formatINR(w.daily_rate) : '—'}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link href={`/workers/${w.id}`}>
                      <button className="text-xs text-[#E94560] hover:underline">View</button>
                    </Link>
                    {!w.certified && (w.badge === 'Expert' || w.badge === 'Master') && w.total_jobs > 10 && (
                      <form action={`/api/admin/workers/${w.id}/certify`} method="POST">
                        <button type="submit" className="text-xs text-yellow-600 hover:underline">Certify</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!workers || workers.length === 0) && (
          <div className="p-12 text-center"><p className="text-[#6B7280]">No workers yet</p></div>
        )}
      </div>
    </div>
  );
}
