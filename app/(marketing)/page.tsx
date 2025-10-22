import Link from 'next/link'

export default function Page() {
  return (
    <section className="grid gap-10 md:grid-cols-2 items-center">
      <div className="space-y-6">
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
          Scheduling that thinks like an ops manager.
        </h1>
        <p className="text-white/80 text-lg">
          Turn messy routes, wages, mileage and calendar chaos into a clean, optimised day — built for cleaning businesses.
        </p>
        <div className="flex gap-3">
          <Link href="/auth/sign-up" className="btn">Start free</Link>
          <Link href="/auth/sign-in" className="btn-secondary">Sign in</Link>
        </div>
        <p className="text-xs text-white/50">(This page is a placeholder — the real marketing site will be Webflow.)</p>
      </div>
      <div className="card p-6">
        <h2 className="font-medium mb-3">Interactive demo</h2>
        {/* Replace with real components later */}
        <div className="rounded-xl bg-black/40 p-6 border border-white/10">
          <p className="text-white/70">Embed your demo dashboard here or show animated screenshots.</p>
        </div>
      </div>
    </section>
  )
}
