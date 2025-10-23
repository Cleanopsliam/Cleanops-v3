'use client'
import { useState } from 'react'
import type { UiJob } from './types'

// Local-date helpers (no UTC conversions)
function isoLocal(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function dateFromISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m as number) - 1, d)
}
function monthMatrix(cursor: Date) {
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const startDay = (start.getDay() + 6) % 7 // Monday start
  const cells: Date[] = []
  let cur = 1 - startDay
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), cur++))
  }
  return cells
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function MonthGrid({
  cursorISO,
  selectedISO,
  jobsByDay,
  range,
  label,
}: {
  cursorISO: string
  selectedISO?: string
  jobsByDay: Record<string, UiJob[]>
  range: 'day' | 'week' | 'month' | 'quarter' | 'year'
  label?: string // optional header label
}) {
  const cursorDate = dateFromISO(cursorISO)
  const weeks = monthMatrix(cursorDate)
  const today = new Date()

  // expand/collapse a day tile
  const [expandedISO, setExpandedISO] = useState<string | null>(selectedISO ?? null)
  const hasJobs = (iso: string) => (jobsByDay[iso]?.length ?? 0) > 0

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium">
          {cursorDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </p>
        {label ? <span className="text-white/60 text-sm">{label}</span> : null}
      </div>

      <div className="grid grid-cols-7 gap-2 text-sm">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-white/60">
            {d}
          </div>
        ))}

        {weeks.map((date, idx) => {
          const inMonth = date.getMonth() === cursorDate.getMonth()
          const dISO = isoLocal(date)
          const marker = hasJobs(dISO)
          const isToday = sameDay(date, today)
          const isSelected = expandedISO
            ? dISO === expandedISO
            : (selectedISO ? dISO === selectedISO : false)
          const isExpanded = expandedISO === dISO
          const jobs = jobsByDay[dISO] ?? []

          return (
            <div
              key={idx}
              role="button"
              onClick={() => {
                const next = isExpanded ? null : dISO
                setExpandedISO(next)
                // optional: sync selected day into URL while staying on month view
                try {
                  const url = new URL(window.location.href)
                  if (next) url.searchParams.set('cursor', next)
                  else url.searchParams.delete('cursor')
                  url.searchParams.set('view', 'month')
                  window.history.replaceState({}, '', url.toString())
                } catch {}
              }}
              className={`relative rounded-xl p-2 text-left border min-h-20 cursor-pointer select-none
                transition-transform duration-200
                ${inMonth ? 'border-white/10 bg-white/5' : 'border-transparent bg-white/0 text-white/40'}
                ${marker ? 'ring-1 ring-mint/60' : ''}
                ${isToday ? 'outline outline-1 outline-white/50' : ''}
                ${isSelected ? 'bg-white/10 border-mint ring-2 ring-mint/70' : ''}
                ${isExpanded ? 'scale-[1.02] shadow-lg shadow-black/20' : ''}
              `}
              title={dISO}
            >
              {/* tiny corner link to Day view */}
              <a
                href={`/dashboard?range=${encodeURIComponent(range)}&view=day&cursor=${dISO}`}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 text-xs opacity-70 hover:opacity-100 underline"
                aria-label={`Open ${dISO} day view`}
              >
                ↗
              </a>

              <div className="text-xs flex items-center gap-1 mb-1">
                <span>{date.getDate()}</span>
                {marker && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-lg bg-white/10">
                    {jobs.length}
                  </span>
                )}
              </div>

              {/* collapsed hint */}
              {!isExpanded && marker && (
                <div className="text-[11px] text-mint">• Jobs scheduled</div>
              )}

              {/* expanded content with animated height */}
              <div
                className={`mt-2 space-y-1 overflow-hidden transition-[max-height] duration-300 ease-out`}
                style={{ maxHeight: isExpanded ? '2000px' : '0px' }}
              >
                {jobs.length === 0 ? (
                  <p className="text-white/60 text-[11px]">No jobs scheduled.</p>
                ) : (
                  jobs.map((j) => (
                    <div key={j.id} className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium truncate max-w-[70%]">
                          {j.title}
                        </span>
                        <span className="text-[11px] text-white/60">
                          {j.start}–{j.end}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/70">
                        £{j.amount.toFixed(2)} {j.clientName ? `• ${j.clientName}` : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}