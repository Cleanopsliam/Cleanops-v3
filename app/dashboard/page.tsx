import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';

import { RangeTabs } from '@/components/dashboard/RangeTabs';
import { Metrics } from '@/components/dashboard/Metrics';
import { MonthGrid } from '@/components/dashboard/MonthGrid';
import { DayAgenda } from '@/components/dashboard/DayAgenda';
import type { Range, View, UiJob } from '@/components/dashboard/types';

/** ===== Local-date helpers (no UTC conversions) ===== */
function isoLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function dateFromISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m as number) - 1, d);
}
function startOf(range: Range, d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (range === 'day') return x;
  if (range === 'week') {
    const dow = x.getDay(); // 0=Sun
    const diff = (dow + 6) % 7; // Monday start
    x.setDate(x.getDate() - diff);
    return x;
  }
  if (range === 'month') return new Date(x.getFullYear(), x.getMonth(), 1);
  if (range === 'quarter') return new Date(x.getFullYear(), Math.floor(x.getMonth() / 3) * 3, 1);
  if (range === 'year') return new Date(x.getFullYear(), 0, 1);
  return x;
}
function endOf(range: Range, d: Date) {
  const s = startOf(range, d);
  if (range === 'day') return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 1);
  if (range === 'week') return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7);
  if (range === 'month') return new Date(s.getFullYear(), s.getMonth() + 1, 1);
  if (range === 'quarter') return new Date(s.getFullYear(), s.getMonth() + 3, 1);
  if (range === 'year') return new Date(s.getFullYear() + 1, 0, 1);
  return s;
}
function addDaysISO(iso: string, inc: number) {
  const d = dateFromISO(iso);
  d.setDate(d.getDate() + inc);
  return isoLocal(d);
}
function addMonthsISO(iso: string, inc: number) {
  const d = dateFromISO(iso);
  d.setMonth(d.getMonth() + inc);
  return isoLocal(d);
}
function hrefWith(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) sp.set(k, v);
  });
  const q = sp.toString();
  return q ? `/dashboard?${q}` : '/dashboard';
}

/** ===== Data fetch (Supabase) ===== */
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
  clients?: { name: string } | { name: string }[] | null;
};

async function fetchJobsInRange(fromISO: string, toISO: string): Promise<UiJob[]> {
  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .from('jobs')
    .select(
      'id, client_id, staff_id, title, job_date, start_time, end_time, amount, completed, clients(name)'
    )
    .gte('job_date', fromISO)
    .lt('job_date', toISO)
    .order('job_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    // Schema not ready? Just return no jobs.
    return [];
  }

  const rows = (data ?? []) as unknown as Array<DbJob>;

  return rows.map((j) => {
    const clientName = Array.isArray(j.clients)
      ? j.clients[0]?.name ?? null
      : j.clients?.name ?? null;

    return {
      id: j.id,
      clientId: j.client_id,
      title: j.title,
      date: j.job_date,
      start: j.start_time,
      end: j.end_time,
      amount: Number(j.amount ?? 0),
      completed: j.completed,
      clientName,
    } satisfies UiJob;
  });
}

/** ===== PAGE ===== */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { range?: Range; view?: View; cursor?: string };
}) {
  const supabase = getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  const range: Range = (searchParams.range as Range) || 'week';
  const view: View = (searchParams.view as View) || 'month';
  const todayISO = isoLocal(new Date());
  const cursorISO = searchParams.cursor || todayISO;

  const now = new Date();
  const fromISO = isoLocal(startOf(range, now));
  const toISO = isoLocal(endOf(range, now));

  const jobs = await fetchJobsInRange(fromISO, toISO);

  // Index jobs by day for schedule
  const jobsByDay = new Map<string, UiJob[]>();
  for (const j of jobs) {
    const arr = jobsByDay.get(j.date) ?? [];
    arr.push(j);
    jobsByDay.set(j.date, arr);
  }
  const dayJobs = jobsByDay.get(cursorISO) ?? [];

  // URL helpers for components
  const makeRangeHref = (r: Range) =>
    hrefWith({ range: r, view, cursor: cursorISO });
  const makeMonthHrefPrev = () =>
    hrefWith({ range, view: 'month', cursor: addMonthsISO(cursorISO, -1) });
  const makeMonthHrefNext = () =>
    hrefWith({ range, view: 'month', cursor: addMonthsISO(cursorISO, +1) });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-white/70">Welcome, {user.email}</p>
      </div>

      {/* Metrics */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Overview</h2>
          <RangeTabs active={range} makeHref={makeRangeHref} />
        </div>
        <Metrics jobs={jobs} label={range} />
      </section>

      {/* Schedule */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Schedule</h2>
          <div className="flex items-center gap-2">
            <a className="btn-secondary" href={hrefWith({ range, view, cursor: todayISO })}>
              Today
            </a>
            <a className="btn-secondary" href={makeMonthHrefPrev()}>
              ◀
            </a>
            <a className="btn-secondary" href={makeMonthHrefNext()}>
              ▶
            </a>
            <a
              className={`px-3 py-2 rounded-2xl border ${
                view === 'day' ? 'bg-white text-black' : 'bg-white/5 border-white/10'
              }`}
              href={hrefWith({ range, view: 'day', cursor: cursorISO })}
            >
              Day
            </a>
            <a
              className={`px-3 py-2 rounded-2xl border ${
                view === 'month' ? 'bg-white text-black' : 'bg-white/5 border-white/10'
              }`}
              href={hrefWith({ range, view: 'month', cursor: cursorISO })}
            >
              Month
            </a>
          </div>
        </div>

        {view === 'month' ? (
<MonthGrid
  cursorISO={cursorISO}
  selectedISO={cursorISO}
  jobsByDay={Object.fromEntries(jobsByDay)}
  range={range}
/>
        ) : (
              <DayAgenda jobs={dayJobs} selectedDateISO={cursorISO} />
        )}
      </section>
    </div>
  );
}