'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  name: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

function parseHHMM(v?: string | null): { h: number | null; m: number | null } {
  if (!v) return { h: null, m: null };
  const [hh, mm] = v.split(':');
  const h = Number(hh),
    m = Number(mm);
  if (Number.isNaN(h) || Number.isNaN(m)) return { h: null, m: null };
  return { h, m };
}
function formatHHMM(h: number | null, m: number | null) {
  if (h == null || m == null) return '';
  return `${pad2(h)}:${pad2(m)}`;
}

/* ───────────────────────── Wheel (snap-to-center) ───────────────────────── */

function Wheel({
  title,
  values,
  selected,
  onSelect,
}: {
  title: string;
  values: number[];
  selected: number | null;
  onSelect: (n: number) => void;
}) {
  const contRef = useRef<HTMLDivElement | null>(null);
  const ROW_H = 44;

  const centerOffset = (el: HTMLElement) => (el.clientHeight - ROW_H) / 2;

  const scrollToIndex = (idx: number, behavior: ScrollBehavior = 'smooth') => {
    const el = contRef.current;
    if (!el) return;
    const c = Math.max(0, Math.min(values.length - 1, idx));
    el.scrollTo({ top: c * ROW_H - centerOffset(el), behavior });
  };

  // Center on current selection when (re)mounting or selection changes
  useLayoutEffect(() => {
    const el = contRef.current;
    if (!el) return;
    const idx = Math.max(0, values.indexOf(selected ?? values[0]));
    // Use 'instant' so there’s no jump animation on open
    scrollToIndex(idx, 'instant' as ScrollBehavior);
  }, [selected, values]);

  // Snap to the closest row after the user scrolls and stops
  const snapTimer = useRef<number | null>(null);
  const onScroll = () => {
    if (snapTimer.current) window.clearTimeout(snapTimer.current);
    snapTimer.current = window.setTimeout(() => {
      const el = contRef.current;
      if (!el) return;
      const center = el.scrollTop + el.clientHeight / 2;
      const idx = Math.round(center / ROW_H - 0.5);
      scrollToIndex(idx);
      // Update selected value to whatever is centered
      const clamped = Math.max(0, Math.min(values.length - 1, idx));
      onSelect(values[clamped]);
    }, 90);
  };

  // Click handler: update value, blur to hide focus ring, and center immediately
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, v: number) => {
    onSelect(v);
    (e.currentTarget as HTMLButtonElement).blur();
    const idx = values.indexOf(v);
    // ensure we center right after React state applies
    requestAnimationFrame(() => scrollToIndex(idx));
  };

  return (
    <div className="relative">
      <div className="mb-1 text-xs text-[var(--muted)]">{title}</div>

      <div
        ref={contRef}
        className="time-wheel relative h-56 overflow-y-auto rounded-xl border bg-[var(--surface)]/50"
        role="listbox"
        onScroll={onScroll}
      >
        {/* Center band (background only; no ring) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2 h-11 rounded-lg bg-[var(--accent)]/8"
        />

        <ul className="py-3">
          {values.map((v) => {
            const active = selected === v;
            return (
              <li key={v} className="px-2">
                <button
                  type="button"
                  aria-selected={active}
                  onClick={(e) => handleClick(e, v)}
                  className={`w-full h-11 rounded-lg text-base scroll-mt-[88px]
                              focus:outline-none focus-visible:outline-none focus:ring-0
                              ${active ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-semibold' : 'hover:bg-white/5'}`}
                  style={{ scrollSnapAlign: 'center' }}
                >
                  {pad2(v)}
                </button>
              </li>
            );
          })}
        </ul>

        {/* soft fades */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[var(--bg)]/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[var(--bg)]/60 to-transparent" />
      </div>
    </div>
  );
}

/* ───────────────────────── Popover ───────────────────────── */

function TimePopover({
  anchorRect,
  value,
  setValue,
  onClose,
}: {
  anchorRect: DOMRect;
  value: { h: number | null; m: number | null };
  setValue: (v: { h: number | null; m: number | null }) => void;
  onClose: () => void;
}) {
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const mins = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const [h, setH] = useState<number | null>(value.h ?? 0);
  const [m, setM] = useState<number | null>(value.m ?? 0);

  useEffect(() => setValue({ h, m }), [h, m, setValue]);

  const presets = [
    { label: '08:00', h: 8, m: 0 },
    { label: '09:00', h: 9, m: 0 },
    { label: '12:00', h: 12, m: 0 },
    { label: '15:00', h: 15, m: 0 },
    { label: '17:00', h: 17, m: 0 },
  ];

  const popStyle: React.CSSProperties = {
    top: Math.min(window.innerHeight - 20, anchorRect.bottom + 8),
    left: Math.max(12, Math.min(anchorRect.left, window.innerWidth - 380)),
    width: 360,
  };

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="absolute rounded-2xl border bg-[var(--bg)] shadow-2xl p-4"
        style={popStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-sm">
          <span className="text-[var(--muted)] mr-2">Selected:</span>
          <span className="font-medium">{formatHHMM(h, m) || '--:--'}</span>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              className="chip"
              onClick={() => {
                setH(p.h);
                setM(p.m);
              }}
            >
              {p.label}
            </button>
          ))}
          <button type="button" className="chip bg-white/5" onClick={() => { setH(null); setM(null); }}>
            Clear
          </button>
          <button type="button" className="chip bg-white/5" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Wheel title="Hour" values={hours} selected={h} onSelect={setH} />
          <Wheel title="Min" values={mins} selected={m} onSelect={setM} />
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ───────────────────────── Main ───────────────────────── */

export default function TimePicker({
  name,
  defaultValue,
  label,
  placeholder = '-- : --',
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<{ h: number | null; m: number | null }>(() => parseHHMM(defaultValue));
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  const display = formatHHMM(value.h, value.m) || placeholder;

  const openPopover = () => {
    const rect = btnRef.current?.getBoundingClientRect() || null;
    setAnchor(rect);
    setOpen(true);
  };

  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}

      {/* Hidden form value */}
      <input type="hidden" name={name} value={formatHHMM(value.h, value.m)} />

      <button
        ref={btnRef}
        type="button"
        onClick={openPopover}
        className="input flex items-center justify-between"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{display}</span>
        <span className="ml-2 opacity-70">🕑</span>
      </button>

      {open && anchor && (
        <TimePopover
          anchorRect={anchor}
          value={value}
          setValue={setValue}
          onClose={() => setOpen(false)}
        />
      )}
    </label>
  );
}