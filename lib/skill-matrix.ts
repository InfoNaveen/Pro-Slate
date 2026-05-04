import type { BadgeTier, WorkerProfile } from '@/types';

export function computeSkillScore(worker: Pick<WorkerProfile, 'total_jobs' | 'avg_rating' | 'completion_rate'>): number {
  const jobPoints = Math.min(worker.total_jobs * 4, 40);
  const ratingPoints = Math.min(worker.avg_rating * 8, 40);
  const completionPoints = Math.min((worker.completion_rate / 100) * 20, 20);
  return Math.round(jobPoints + ratingPoints + completionPoints);
}

export function computeReliabilityScore(params: {
  on_time_milestones: number;
  total_milestones: number;
  has_disputes: boolean;
  repeat_clients: number;
}): number {
  const { on_time_milestones, total_milestones, has_disputes, repeat_clients } = params;
  const baseScore = total_milestones > 0 ? (on_time_milestones / total_milestones) * 60 : 0;
  const disputeBonus = has_disputes ? 0 : 20;
  const repeatBonus = repeat_clients > 2 ? 20 : 0;
  return Math.round(Math.min(baseScore + disputeBonus + repeatBonus, 100));
}

export function getBadgeTier(skillScore: number): BadgeTier {
  if (skillScore <= 30) return 'Rookie';
  if (skillScore <= 55) return 'Verified';
  if (skillScore <= 80) return 'Expert';
  return 'Master';
}

export function isCertifiedPartner(worker: Pick<WorkerProfile, 'badge' | 'completion_rate' | 'total_jobs'>): boolean {
  return (
    (worker.badge === 'Expert' || worker.badge === 'Master') &&
    worker.completion_rate > 85 &&
    worker.total_jobs > 10
  );
}

export function getBadgeColor(badge: BadgeTier): string {
  switch (badge) {
    case 'Rookie': return 'bg-gray-100 text-gray-600';
    case 'Verified': return 'bg-blue-100 text-blue-700';
    case 'Expert': return 'bg-red-100 text-[#E94560]';
    case 'Master': return 'bg-yellow-100 text-yellow-700';
  }
}

export function getBadgeBorderColor(badge: BadgeTier): string {
  switch (badge) {
    case 'Rookie': return 'border-gray-300';
    case 'Verified': return 'border-blue-400';
    case 'Expert': return 'border-[#E94560]';
    case 'Master': return 'border-yellow-500';
  }
}
