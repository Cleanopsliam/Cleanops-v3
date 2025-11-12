'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  name: string
  defaultValue?: number[] // 1..7 (Mon..Sun)
  label?: string
}

const DAYS = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 7, label: 'Sun' },
]

export default function DaysSelect({ name, defaultValue = [], label = 'Available days' }: Props) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<number[]>(defaultValue)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)

  const chips = useMemo(() => {
    if (!value.length) return []
    const map = new Map(DAYS.map(d => [d.id, d.label]))
    return [...value].sort((a, b) => a - b).map(v => map.get(v)!)
  }, [value])

  const summaryText = useMemo(() => {
    if (!value.length) return 'Select days'
    if (value.length === 7) return 'All days'
    if (value.length === 5 && !value.includes(6) && !value.includes(7)) return 'Weekdays'
    if (value.length === 2 && value.includes(6) && value.includes(7)) return 'Weekends'
    return chips.join(', ')
  }, [value, chips])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (!popRef.current?.contains(t) && !triggerRef.current?.contains(t)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const [pos, setPos] = useState({ top: 0, left: 0, width: 360 })
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  useEffect(() => {
    if (!open || !triggerRef.current || isMobile) return
    const r = triggerRef.current.getBoundingClientRect()
    const pad = 12
    const width = Math.max(r.width, 360)
    let left = Math.max(pad, Math.min(r.left, window.innerWidth - width - pad))
    let top = r.bottom + 8
    const estH = 280
    if (top + estH > window.innerHeight - pad) {
      top = Math.max(pad, r.top - estH - 8)
    }
    setPos({ top, left, width })
  }, [open, isMobile])

  const toggle = (id: number) =>
    setValue(prev => (prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]))

  const setWeekdays = () => setValue([1, 2, 3, 4, 5])
  const setWeekends = () => setValue([6, 7])
  const setAll = () => setValue([1, 2, 3, 4, 5, 6, 7])
  const clear = () => setValue([])

  return (
    <label className="field md:col-span-2">
      <span className="field-label">{label}</span>

      <input type="hidden" name={name} value={[...value].sort((a, b) => a - b).join(',')} />

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="input flex items-center justify-between"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <div className="min-h-[1.5rem] flex flex-wrap gap-1">
          {chips.length && chips.length <= 3
            ? chips.map(l => (
                <span key={l} className="badge">{l}</span>
              ))
            : <span className={value.length ? '' : 'text-[var(--muted)]'}>{summaryText}</span>}
        </div>
        <span className="ml-2 text-[var(--muted)]">▾</span>
      </button>

      {open &&
        createPortal(
          isMobile ? (
            <div className="fixed inset-0 z-[70] bg-black/40" role="dialog" aria-modal="true">
              <div className="absolute inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl border bg-[var(--bg)] p-4">
                <Header value={value} setWeekdays={setWeekdays} setWeekends={setWeekends} setAll={setAll} clear={clear} onClose={() => setOpen(false)} />
                <DaysGrid value={value} toggle={toggle} />
              </div>
            </div>
          ) : (
            <div
              ref={popRef}
              className="fixed z-[60] rounded-2xl border bg-[var(--bg)] shadow-2xl p-3 sm:p-4"
              style={{ top: pos.top, left: pos.left, width: pos.width, maxWidth: 'min(640px, 96vw)' }}
              role="dialog"
              aria-modal="true"
            >
              <Header value={value} setWeekdays={setWeekdays} setWeekends={setWeekends} setAll={setAll} clear={clear} onClose={() => setOpen(false)} />
              <DaysGrid value={value} toggle={toggle} />
            </div>
          ),
          document.body
        )}
    </label>
  )
}

function Header({
  value, setWeekdays, setWeekends, setAll, clear, onClose,
}: {
  value: number[]
  setWeekdays: () => void
  setWeekends: () => void
  setAll: () => void
  clear: () => void
  onClose: () => void
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="text-xs text-[var(--muted)]">
        {value.length ? `${value.length} selected` : 'No days selected'}
      </span>
      <div className="ml-auto flex flex-wrap gap-2">
        <button type="button" className="chip" onClick={setWeekdays}>Weekdays</button>
        <button type="button" className="chip" onClick={setWeekends}>Weekends</button>
        <button type="button" className="chip" onClick={setAll}>All</button>
        <button type="button" className="chip bg-white/5" onClick={clear}>Clear</button>
        <button type="button" className="chip bg-white/5" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

function DaysGrid({ value, toggle }: { value: number[]; toggle: (id: number) => void }) {
  return (
    <div className="grid grid-cols-7 gap-2 sm:grid-cols-7">
      {DAYS.map(d => {
        const active = value.includes(d.id)
        return (
          <label key={d.id} className={`day-tile ${active ? 'day-on' : ''}`} aria-pressed={active}>
            <input type="checkbox" className="sr-only" checked={active} onChange={() => toggle(d.id)} />
            {d.label}
          </label>
        )
      })}
    </div>
  )
}