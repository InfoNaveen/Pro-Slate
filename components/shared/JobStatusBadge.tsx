import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types';

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600' },
  quoted: { label: 'Quoted', color: 'bg-blue-50 text-blue-600' },
  matched: { label: 'Matched', color: 'bg-purple-50 text-purple-600' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  milestone_review: { label: 'Under Review', color: 'bg-yellow-50 text-yellow-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  disputed: { label: 'Disputed', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
};

export default function JobStatusBadge({ status }: { status: JobStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', config.color)}>
      {config.label}
    </span>
  );
}
