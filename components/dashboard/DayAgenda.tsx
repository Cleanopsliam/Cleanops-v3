import type { UiJob } from './types';

function fmtGBP(n: number) {
  return `£${n.toFixed(2)}`;
}
function displayLocal(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m as number) - 1, d);
  return date.toLocaleString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

export function DayAgenda({ jobs, selectedDateISO }: { jobs: UiJob[]; selectedDateISO: string }) {
  const list = [...jobs].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">{displayLocal(selectedDateISO)}</h3>
        <span className="text-white/60 text-sm">{list.length} job{list.length===1?'':'s'}</span>
      </div>
      <div className="space-y-2">
        {list.length === 0 ? (
          <p className="text-white/60 text-sm">No jobs scheduled.</p>
        ) : (
          list.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{job.title}</p>
                <span className="text-white/60 text-sm">
                  {job.start}–{job.end}
                </span>
              </div>
              <div className="text-white/70 text-sm mt-1">
                {fmtGBP(job.amount)} • {job.completed ? 'Completed' : 'Scheduled'}
                {job.clientName ? ` • ${job.clientName}` : ''}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}