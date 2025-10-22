'use client'
import { useState } from 'react'

const tabs = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'staff', label: 'Staff' },
  { id: 'mileage', label: 'Mileage' },
  { id: 'wages', label: 'Wages' }
]

export function DemoTabs() {
  const [active, setActive] = useState('schedule')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 rounded-2xl border ${active === t.id ? 'bg-white text-black' : 'bg-white/5 border-white/10'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="card p-6 min-h-[320px]">
        {active === 'schedule' && <p>Drag jobs between staff; see overlaps and travel guardrails.</p>}
        {active === 'staff' && <p>Availability windows, finish times, holiday accrual.</p>}
        {active === 'mileage' && <p>Depot → pickup → drop‑off → depot, HMRC mileage.</p>}
        {active === 'wages' && <p>Live wage cost per job and daily total.</p>}
      </div>
    </div>
  )
}
