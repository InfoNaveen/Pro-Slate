import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatINR, formatDate } from '@/lib/utils';
import type { Job } from '@/types';

export default async function ContractReportPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: contract } = await supabase
    .from('b2b_contracts')
    .select('*')
    .eq('id', params.id)
    .eq('client_id', session.user.id)
    .single();

  if (!contract) notFound();

  const { data: profile } = await supabase.from('profiles').select('*, b2b_client_profiles(*)').eq('id', session.user.id).single();
  const { data: jobs } = await supabase.from('jobs').select('*, milestones(*)').eq('client_id', session.user.id).eq('is_b2b', true);
  const workerIds: string[] = contract.worker_ids ?? [];
  const { data: workers } = workerIds.length > 0
    ? await supabase.from('worker_profiles').select('*, profiles!inner(full_name)').in('id', workerIds)
    : { data: [] };

  const totalSpend = jobs?.reduce((s, j) => s + (j.final_cost ?? 0), 0) ?? 0;
  const completedJobs = jobs?.filter((j) => j.status === 'completed') ?? [];
  const companyName = (profile as { b2b_client_profiles?: { company_name?: string } })?.b2b_client_profiles?.company_name ?? 'Company';

  return (
    <html>
      <head>
        <title>ProSlate Contract Report — {contract.title}</title>
        <style>{`
          body { font-family: 'Inter', Arial, sans-serif; color: #1A1A2E; margin: 0; padding: 40px; background: white; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #1A1A2E; }
          .logo { font-size: 24px; font-weight: 800; color: #1A1A2E; }
          .logo span { color: #E94560; }
          h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
          h2 { font-size: 16px; font-weight: 600; margin: 24px 0 12px; color: #1A1A2E; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
          .meta { color: #6B7280; font-size: 13px; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
          .stat { background: #F5F5F0; border-radius: 8px; padding: 16px; text-align: center; }
          .stat-value { font-size: 22px; font-weight: 800; color: #1A1A2E; }
          .stat-label { font-size: 12px; color: #6B7280; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #1A1A2E; color: white; padding: 10px 12px; text-align: left; font-weight: 600; }
          td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
          tr:nth-child(even) td { background: #fafafa; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
          .badge-completed { background: #d1fae5; color: #065f46; }
          .badge-progress { background: #dbeafe; color: #1e40af; }
          .badge-pending { background: #f3f4f6; color: #6b7280; }
          .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
          @media print { body { padding: 20px; } }
        `}</style>
      </head>
      <body>
        <div className="header">
          <div>
            <div className="logo">Pro<span>Slate</span></div>
            <p className="meta">India's Verified Surface Finishing Network</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1>{contract.title}</h1>
            <p className="meta">Contract Report · Generated {new Date().toLocaleDateString('en-IN')}</p>
            <p className="meta">{companyName}</p>
          </div>
        </div>

        <div className="stats">
          <div className="stat"><div className="stat-value">{workerIds.length}</div><div className="stat-label">Workers Deployed</div></div>
          <div className="stat"><div className="stat-value">{jobs?.length ?? 0}</div><div className="stat-label">Total Jobs</div></div>
          <div className="stat"><div className="stat-value">{completedJobs.length}</div><div className="stat-label">Completed</div></div>
          <div className="stat"><div className="stat-value">{formatINR(totalSpend)}</div><div className="stat-label">Total Spend</div></div>
        </div>

        <h2>Contract Information</h2>
        <table>
          <tbody>
            <tr><td><strong>Title</strong></td><td>{contract.title}</td></tr>
            <tr><td><strong>Status</strong></td><td>{contract.status}</td></tr>
            {contract.start_date && <tr><td><strong>Start Date</strong></td><td>{formatDate(contract.start_date)}</td></tr>}
            {contract.end_date && <tr><td><strong>End Date</strong></td><td>{formatDate(contract.end_date)}</td></tr>}
            {contract.monthly_rate && <tr><td><strong>Monthly Rate</strong></td><td>{formatINR(contract.monthly_rate)}</td></tr>}
            <tr><td><strong>Services</strong></td><td>{(contract.service_categories ?? []).join(', ')}</td></tr>
            {contract.sla_terms && <tr><td><strong>SLA Terms</strong></td><td>{contract.sla_terms}</td></tr>}
          </tbody>
        </table>

        {workers && workers.length > 0 && (
          <>
            <h2>Assigned Workers</h2>
            <table>
              <thead><tr><th>Name</th><th>Badge</th><th>Rating</th><th>Jobs Done</th></tr></thead>
              <tbody>
                {workers.map((w: { id: string; badge: string; avg_rating: number; total_jobs: number; profiles: { full_name: string } }) => (
                  <tr key={w.id}>
                    <td>{w.profiles.full_name}</td>
                    <td>{w.badge}</td>
                    <td>{w.avg_rating.toFixed(1)} ★</td>
                    <td>{w.total_jobs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {jobs && jobs.length > 0 && (
          <>
            <h2>Job Summary</h2>
            <table>
              <thead><tr><th>Project</th><th>Service</th><th>Area</th><th>Cost</th><th>Status</th></tr></thead>
              <tbody>
                {jobs.map((job: Job) => (
                  <tr key={job.id}>
                    <td>{job.project_name ?? '—'}</td>
                    <td>{job.service_category.replace(/_/g, ' ')}</td>
                    <td>{job.area_sqft} sqft</td>
                    <td>{formatINR(job.final_cost ?? 0)}</td>
                    <td>
                      <span className={`badge ${job.status === 'completed' ? 'badge-completed' : job.status === 'in_progress' ? 'badge-progress' : 'badge-pending'}`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="footer">
          <p>ProSlate · India's Verified Surface Finishing Network · Bengaluru, Karnataka</p>
          <p>This report was auto-generated by ProSlate platform. For queries: hello@proslate.in</p>
          <button onClick={() => window.print()} style={{ marginTop: '12px', padding: '8px 20px', background: '#1A1A2E', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
            🖨 Print / Save as PDF
          </button>
        </div>
      </body>
    </html>
  );
}
