import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';

/** ================= Helpers (all inline, no extra files) ================= */

type Range = 'day' | 'week' | 'month' | 'quarter' | 'year';
type View = 'day' | 'month';

type DbJob = {
  id: string;
  client_id: string | null;
  staff_id: string | null;
  title: string;
  job_date: string;   // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  amount: number | null;
  completed: boolean;
  clients?: { name: string } | null;
};

type UiJob = {
  id: string;
  clientId: string | null;
  title: string;
  date: string;   // YYYY-MM-DD
  start: string;  // HH:mm
  end: string;    // HH:mm
  amount: number;
  completed: boolean;
  clientName?: string | null;
};

function startOf(range: Range, d: Date) {
  const x = new Date(d);
  if (range === 'day') x.setHours(0, 0, 0, 0);
  else if (range === 'week') {
    const diff = (x.getDay() + 6) % 7; // Monday start
    x.setDate(x.getDate() - diff); x.setHours(0, 0, 0, 0);
  } else if (range === 'month') { x.setDate(1); x.setHours(0, 0, 0, 0); }
  else if (range === 'quarter') { x.setMonth(Math.floor(x.getMonth() / 3) * 3, 1); x.setHours(0, 0, 0, 0); }
  else if (range === 'year') { x.setMonth(0, 1); x.setHours(0, 0, 0, 0); }
  return x;
}
function endOf(range: Range, d: Date) {
  const s = startOf(range, d);
  const e = new Date(s);
  if (range === 'day') e.setDate(e.getDate() + 1);
  if (range === 'week') e.setDate(e.getDate() + 7);
  if (range === 'month') e.setMonth(e.getMonth() + 1);
  if (range === 'quarter') e.setMonth(e.getMonth() + 3);
  if (range === 'year') e.setFullYear(e.getFullYear() + 1);
  return e;
}
function fmtGBP(n: number) {
  return `£${n.toFixed(2)}`;
}
function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function addDaysISO(isoDate: string, inc: number) {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + inc);
  return iso(d);
}
function monthMatrix(cursor: Date) {
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startDay = (start.getDay() + 6) % 7; // Monday start
  const cells: Date[] = [];
  let cur = 1 - startDay;
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), cur++));
  }
  return cells;
}
function hrefWith(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
  const q = sp.toString();
  return q ? `/dashboard?${q}` : '/dashboard';
}

/** ================= Data fetch (jobs) ================= */

async function fetchJobsInRange(fromISO: string, toISO: string): Promise<UiJob[]> {
  const supabase = getServerSupabase();

  // Try live data from Supabase (jobs + client name). If table missing, return empty.
  const { data, error } = await supabase
    .from('jobs')
    .select('id, client_id, staff_id, title, job_date, start_time, end_time, amount, completed, clients(name)')
    .gte('job_date', fromISO)
    .lt('job_date', toISO)
    .order('job_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    // Graceful fallback if schema not ready yet
    // console.error('fetchJobsInRange error:', error.message);
    return [];
  }

  const db = (data ?? []) as DbJob[];
  return db.map(j => ({
    id: j.id,
    clientId: j.client_id,
    title: j.title,
    date: j.job_date,
    start: j.start_time,
    end: j.end_time,
    amount: Number(j.amount ?? 0),
    completed: j.completed,
    clientName: j.clients?.name ?? null
  }));
}

function computeMetrics(jobs: UiJob[], fromISO: string, toISO: string) {
  const from = new Date(fromISO + 'T00:00:00');
  const to = new Date(toISO + 'T00:00:00');
  const inRange = jobs.filter(j => {
    const d = new Date(j.date + 'T00:00:00');
    return d >= from && d < to;
  });
  const earnings = inRange.reduce((s, j) => s + (j.amount || 0), 0);
  const clients = new Set(inRange.map(j => j.clientId).filter(Boolean));
  const completed = inRange.filter(j => j.completed).length;
  return { earnings, clientCount: clients.size, jobsCompleted: completed };
}

/** ================= PAGE ================= */

export default async function DashboardPage({
  searchParams
}: { searchParams: { range?: Range; view?: View; cursor?: string } }) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  const range: Range = (searchParams.range as Range) || 'week';
  const view: View = (searchParams.view as View) || 'month';
  const todayISO = iso(new Date());
  const cursorISO = searchParams.cursor || todayISO;

  const now = new Date();
  const fromISO = iso(startOf(range, now));
  const toISO = iso(endOf(range, now));

  const jobs = await fetchJobsInRange(fromISO, toISO);
  const { earnings, clientCount, jobsCompleted } = computeMetrics(jobs, fromISO, toISO);

  // Calendar/day data
  const cursorDate = new Date(cursorISO + 'T00:00:00');
  const jobsByDay = new Map<string, UiJob[]>();
  for (const j of jobs) {
    const arr = jobsByDay.get(j.date) ?? [];
    arr.push(j);
    jobsByDay.set(j.date, arr);
  }
  const dayJobs = (jobsByDay.get(cursorISO) ?? []).sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-white/70">Welcome, {user.email}</p>
      </div>

      {/* Metrics with server-driven toggle */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Overview</h2>
          <div className="flex gap-2">
            {(['day','week','month','quarter','year'] as Range[]).map(r => (
              <a
                key={r}
                href={hrefWith({ range: r, view, cursor: cursorISO })}
                className={`px-3 py-2 rounded-2xl border ${range===r ? 'bg-white text-black' : 'bg-white/5 border-white/10'}`}
              >
                {r[0].toUpperCase()+r.slice(1)}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="text-white/60 text-sm">Earnings ({range})</p>
            <p className="text-3xl font-semibold mt-1">{fmtGBP(earnings)}</p>
          </div>
          <div className="card p-5">
            <p className="text-white/60 text-sm">Clients ({range})</p>
            <p className="text-3xl font-semibold mt-1">{clientCount}</p>
          </div>
          <div className="card p-5">
            <p className="text-white/60 text-sm">Jobs completed ({range})</p>
            <p className="text-3xl font-semibold mt-1">{jobsCompleted}</p>
          </div>
        </div>
      </section>

      {/* Schedule (Month/Day) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Schedule</h2>
          <div className="flex items-center gap-2">
            <a className="btn-secondary" href={hrefWith({ range, view, cursor: todayISO })}>Today</a>
            <a
              className="btn-secondary"
              href={hrefWith({
                range,
                view: 'month',
                cursor: iso(new Date(new Date(cursorISO + 'T00:00:00').setMonth(cursorDate.getMonth() - 1)))
              })}
            >◀</a>
            <a
              className="btn-secondary"
              href={hrefWith({
                range,
                view: 'month',
                cursor: iso(new Date(new Date(cursorISO + 'T00:00:00').setMonth(cursorDate.getMonth() + 1)))
              })}
            >▶</a>
            <a className={`px-3 py-2 rounded-2xl border ${view==='day'?'bg-white text-black':'bg-white/5 border-white/10'}`}
               href={hrefWith({ range, view: 'day', cursor: cursorISO })}>Day</a>
            <a className={`px-3 py-2 rounded-2xl border ${view==='month'?'bg-white text-black':'bg-white/5 border-white/10'}`}
               href={hrefWith({ range, view: 'month', cursor: cursorISO })}>Month</a>
          </div>
        </div>

        {view === 'month' ? (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium">
                {cursorDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="grid grid-cols-7 gap-2 text-sm">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                <div key={d} className="text-white/60">{d}</div>
              ))}

              {monthMatrix(cursorDate).map((date, idx) => {
                const inMonth = date.getMonth() === cursorDate.getMonth();
                const dISO = iso(date);
                const hasJobs = (jobsByDay.get(dISO)?.length ?? 0) > 0;
                const isToday = sameDay(date, new Date());
                return (
                  <a
                    key={idx}
                    href={hrefWith({ range, view: 'day', cursor: dISO })}
                    className={`rounded-xl p-2 h-20 text-left border
                      ${inMonth ? 'border-white/10 bg-white/5' : 'border-transparent bg-white/0 text-white/40'}
                      ${hasJobs ? 'ring-1 ring-mint/60' : ''}
                      ${isToday ? 'outline outline-1 outline-white/50' : ''}
                    `}
                    title={dISO}
                  >
                    <div className="text-xs">{date.getDate()}</div>
                    {hasJobs && <div className="mt-1 text-[11px] text-mint">• Jobs scheduled</div>}
                  </a>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium">
                {cursorDate.toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <div className="flex gap-2">
                <a className="btn-secondary" href={hrefWith({ range, view: 'day', cursor: addDaysISO(cursorISO, -1) })}>◀</a>
                <a className="btn-secondary" href={hrefWith({ range, view: 'day', cursor: addDaysISO(cursorISO, +1) })}>▶</a>
              </div>
            </div>

            <div className="space-y-2">
              {dayJobs.length === 0 ? (
                <p className="text-white/60 text-sm">No jobs scheduled.</p>
              ) : dayJobs.map(job => (
                <div key={job.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{job.title}</p>
                    <span className="text-white/60 text-sm">{job.start}–{job.end}</span>
                  </div>
                  <div className="text-white/70 text-sm mt-1">
                    {fmtGBP(job.amount)} • {job.completed ? 'Completed' : 'Scheduled'}
                    {job.clientName ? ` • ${job.clientName}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
