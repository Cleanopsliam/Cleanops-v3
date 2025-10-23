import type { UiJob } from './types';

export function Metrics({ jobs, label }: { jobs: UiJob[]; label: string }) {
  const earnings = jobs.reduce((s, j) => s + (j.amount || 0), 0);
  const clients = new Set(jobs.map((j) => j.clientId).filter(Boolean));
  const completed = jobs.filter((j) => j.completed).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="card p-5">
        <p className="text-white/60 text-sm">Earnings ({label})</p>
        <p className="text-3xl font-semibold mt-1">£{earnings.toFixed(2)}</p>
      </div>
      <div className="card p-5">
        <p className="text-white/60 text-sm">Clients ({label})</p>
        <p className="text-3xl font-semibold mt-1">{clients.size}</p>
      </div>
      <div className="card p-5">
        <p className="text-white/60 text-sm">Jobs completed ({label})</p>
        <p className="text-3xl font-semibold mt-1">{completed}</p>
      </div>
    </div>
  );
}