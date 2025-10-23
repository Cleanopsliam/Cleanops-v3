import type { Range } from './types';

export function RangeTabs({
  active,
  makeHref,
}: {
  active: Range;
  makeHref: (r: Range) => string;
}) {
  const ranges: Range[] = ['day', 'week', 'month', 'quarter', 'year'];
  return (
    <div className="flex gap-2">
      {ranges.map((r) => (
        <a
          key={r}
          href={makeHref(r)}
          className={`px-3 py-2 rounded-2xl border ${
            active === r ? 'bg-white text-black' : 'bg-white/5 border-white/10'
          }`}
        >
          {r[0].toUpperCase() + r.slice(1)}
        </a>
      ))}
    </div>
  );
}