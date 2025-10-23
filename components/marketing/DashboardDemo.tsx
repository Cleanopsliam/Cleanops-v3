'use client'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Tab = 'overview' | 'scheduling' | 'clients' | 'staff' | 'invoices'
const tabs: { id: Tab; label: string }[] = [
  { id: 'overview',  label: 'Overview' },
  { id: 'scheduling',label: 'Scheduling' },
  { id: 'clients',   label: 'Clients' },
  { id: 'staff',     label: 'Staff' },
  { id: 'invoices',  label: 'Invoices' },
]

// ---- fake data (static) ----
const fakeJobs = [
  { id: 'j1', title: 'End of Tenancy – 2BR',    date: '2025-10-23', start: '09:00', end: '11:00', amount: 180, client: 'Smith Realty', staff: 'Leah' },
  { id: 'j2', title: 'Office Weekly – Floor 4', date: '2025-10-23', start: '11:30', end: '13:00', amount: 120, client: 'Acme Ltd',     staff: 'Jon' },
  { id: 'j3', title: 'Deep Clean – 3BR',        date: '2025-10-24', start: '10:00', end: '13:00', amount: 260, client: 'Brown Family', staff: 'Nia' },
  { id: 'j4', title: 'Airbnb Turnover',         date: '2025-10-24', start: '15:00', end: '16:30', amount: 90,  client: 'StayCo',       staff: 'Leah' },
]
const fakeClients = [
  { id: 'c1', name: 'Smith Realty',   jobs: 42, value: 7800 },
  { id: 'c2', name: 'Acme Ltd',       jobs: 28, value: 4100 },
  { id: 'c3', name: 'Brown Family',   jobs: 7,  value:  980 },
  { id: 'c4', name: 'StayCo',         jobs: 16, value: 2350 },
]
const fakeStaff = [
  { id: 's1', name: 'Leah', hours: 34, mileage: 62, jobs: 18 },
  { id: 's2', name: 'Jon',  hours: 29, mileage: 51, jobs: 15 },
  { id: 's3', name: 'Nia',  hours: 22, mileage: 43, jobs: 11 },
]
const fakeInvoices = [
  { id: 'i1', client: 'Smith Realty',  total: 420, status: 'Paid',      date: '2025-10-10' },
  { id: 'i2', client: 'Acme Ltd',      total: 610, status: 'Overdue',   date: '2025-10-07' },
  { id: 'i3', client: 'Brown Family',  total: 260, status: 'Sent',      date: '2025-10-21' },
  { id: 'i4', client: 'StayCo',        total: 330, status: 'Paid',      date: '2025-10-18' },
]

// nicer sparkline (rounded stroke)
function Sparkline({ values }: { values: number[] }) {
  const d = useMemo(() => {
    const w = 120, h = 36
    const max = Math.max(...values), min = Math.min(...values)
    const toXY = (v: number, i: number) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / Math.max(1, max - min)) * h
      return [x, y] as const
    }
    return values.map((v, i) => {
      const [x, y] = toXY(v, i)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }, [values])

  return (
    <svg width={120} height={36} className="opacity-90">
      <path
        d={d}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className={`px-3 py-1 rounded-full border text-sm
      ${active ? 'bg-white text-black' : 'bg-[var(--surface-2)] border-[var(--border)]'}`}>
      {children}
    </span>
  )
}

export default function DashboardDemo() {
  const [tab, setTab] = useState<Tab>('overview')

  const earnings = fakeJobs.reduce((s, j) => s + j.amount, 0)
  const uniqueClients = new Set(fakeJobs.map(j => j.client)).size
  const completed = 3 // pretend

  return (
    <div className="card p-6 md:p-8">
      {/* top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Pill>Today</Pill>
          <Pill>Week</Pill>
          <Pill active>Month</Pill>
          <Pill>Quarter</Pill>
          <Pill>Year</Pill>
        </div>
        <div className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-xl border text-sm transition
                ${tab === t.id ? 'bg-white text-black' : 'bg-[var(--surface-2)] border-[var(--border)] hover:opacity-90'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4">
                <p className="text-sm opacity-70 mb-1">Earnings (month)</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-semibold">£{earnings.toFixed(2)}</p>
                  <Sparkline values={[3,5,6,4,8,7,9]} />
                </div>
              </div>
              <div className="card p-4">
                <p className="text-sm opacity-70 mb-1">Active Clients</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-semibold">{uniqueClients}</p>
                  <Sparkline values={[2,2,3,3,4,4,5]} />
                </div>
              </div>
              <div className="card p-4">
                <p className="text-sm opacity-70 mb-1">Jobs Completed</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-semibold">{completed}</p>
                  <Sparkline values={[1,2,1,3,2,4,3]} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card p-4">
                <h4 className="font-semibold mb-3">Upcoming Jobs</h4>
                <div className="space-y-2">
                  {fakeJobs.slice(0,3).map(j => (
                    <div key={j.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                      <div>
                        <p className="font-medium">{j.title}</p>
                        <p className="text-sm opacity-70">{j.date} • {j.start}–{j.end} • {j.client}</p>
                      </div>
                      <p className="text-sm font-semibold">£{j.amount}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold mb-3">Revenue by Client</h4>
                <div className="space-y-2">
                  {fakeClients.map(c => (
                    <div key={c.id} className="grid grid-cols-5 items-center gap-2">
                      <span className="col-span-2">{c.name}</span>
                      <div className="col-span-2 h-2 rounded bg-[var(--surface-2)] overflow-hidden">
                        <div className="h-full gradient-accent" style={{ width: `${Math.min(100, (c.value/7800)*100)}%` }} />
                      </div>
                      <span className="text-sm text-right opacity-80">£{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'scheduling' && (
          <motion.div key="scheduling" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <div className="card p-4">
              <h4 className="font-semibold mb-3">Auto Scheduling (demo)</h4>
              <p className="text-sm opacity-80 mb-4">
                CleanOpsAI auto-assigns jobs based on availability, distance and workload. Here’s a sample of how the engine distributes work.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {fakeStaff.map(s => {
                  const jobs = fakeJobs.filter(j => j.staff === s.name)
                  return (
                    <div key={s.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                      <p className="font-medium mb-1">{s.name}</p>
                      <p className="text-sm opacity-70 mb-2">{jobs.length} job(s) • {s.hours}h • {s.mileage}mi</p>
                      <div className="space-y-2">
                        {jobs.map(j => (
                          <div key={j.id} className="text-sm rounded border border-[var(--border)] bg-[var(--surface)] p-2">
                            {j.start}–{j.end} • {j.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'clients' && (
          <motion.div key="clients" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <div className="card p-4">
              <h4 className="font-semibold mb-3">Clients</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left opacity-70">
                      <th className="py-2 pr-4">Client</th>
                      <th className="py-2 pr-4">Jobs</th>
                      <th className="py-2 pr-4">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fakeClients.map(c => (
                      <tr key={c.id} className="border-t border-[var(--border)]">
                        <td className="py-2 pr-4">{c.name}</td>
                        <td className="py-2 pr-4">{c.jobs}</td>
                        <td className="py-2 pr-4">£{c.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'staff' && (
          <motion.div key="staff" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <div className="card p-4">
              <h4 className="font-semibold mb-3">Staff</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {fakeStaff.map(s => (
                  <div key={s.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm opacity-70">Hours: {s.hours} • Mileage: {s.mileage} • Jobs: {s.jobs}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'invoices' && (
          <motion.div key="invoices" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <div className="card p-4">
              <h4 className="font-semibold mb-3">Invoices</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left opacity-70">
                      <th className="py-2 pr-4">Client</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fakeInvoices.map(inv => (
                      <tr key={inv.id} className="border-top border-[var(--border)]">
                        <td className="py-2 pr-4">{inv.client}</td>
                        <td className="py-2 pr-4">£{inv.total}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            inv.status === 'Paid' ? 'bg-green-500/18 text-green-400' :
                            inv.status === 'Overdue' ? 'bg-red-500/18 text-red-400' :
                            'bg-yellow-500/18 text-yellow-400'
                          }`}>{inv.status}</span>
                        </td>
                        <td className="py-2 pr-4">{inv.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}