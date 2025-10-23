'use client'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useTheme } from '@/components/theme/ThemeProvider'
import DashboardDemo from '@/components/marketing/DashboardDemo'

export default function HomePage() {
  const { theme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  const yHero = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0.6])

  return (
    <main ref={ref} className="min-h-screen overflow-hidden">
      {/* ====================== HERO ====================== */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-[90vh] overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: yHero, opacity: opacityHero }}
        >
          <div className="absolute inset-0 bg-[var(--bg)]/90 backdrop-blur-sm" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl px-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            Transform Your Cleaning Business <br />
            with{' '}
          <span className="gradient-accent-text">CleanOpsAI</span>
          </h1>
          <p className="text-lg text-[var(--muted)] mb-8">
            Automate scheduling, staff management, invoicing and more.  
            Built by cleaners, for cleaners — powered by AI.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard" className="btn text-base">
              Try the Demo
            </Link>
            <Link href="/pricing" className="btn-secondary text-base">
              View Pricing
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ====================== INTERACTIVE DASHBOARD DEMO ====================== */}
      <section className="container mx-auto my-32 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold mb-6"
        >
          See CleanOpsAI in Action
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-[var(--muted)] mb-10 max-w-2xl mx-auto"
        >
          Explore a live, interactive preview. Toggle through scheduling, client and staff
          management, and invoicing — all powered by smart automation.
        </motion.p>

        <DashboardDemo />
      </section>

      {/* ====================== FEATURES GRID ====================== */}
      <section className="container mx-auto mb-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center mb-16"
        >
          Everything You Need —{' '}
          <span className="text-[var(--accent)]">Automated</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: 'Auto Scheduling',
              desc: 'Let AI assign jobs to the right staff based on availability, distance, and workload — no more manual rota chaos.',
            },
            {
              title: 'Customer Management',
              desc: 'A full CRM built for cleaners. Store client info, track jobs, invoices, and communication.',
            },
            {
              title: 'Staff Management',
              desc: 'Track hours, mileage, wages and performance automatically. Simplify payroll forever.',
            },
            {
              title: 'Smart Invoicing',
              desc: 'Generate and send branded invoices instantly with integrated payment tracking and reminders.',
            },
            {
              title: 'Analytics Dashboard',
              desc: 'Get real-time insights into revenue, profit, and job performance to grow smarter, not harder.',
            },
            {
              title: 'AI Suggestions',
              desc: 'The system learns your business to suggest smarter routes, job pairings, and time-saving automations.',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="card p-8 text-center hover:scale-[1.02] hover:shadow-xl transition-all"
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-[var(--muted)] leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====================== STORY / SEO SECTION ====================== */}
      <section className="bg-[var(--surface)] py-24 mb-32 border-t border-b border-[var(--border)] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-5xl"
        >
          <h2 className="text-3xl font-bold mb-6">
            The Future of Cleaning Operations
          </h2>
          <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">
            Traditional cleaning companies lose hours every week juggling WhatsApp messages,
            paper schedules, and spreadsheets. CleanOpsAI eliminates the chaos by connecting
            your customers, staff, and jobs in one intelligent platform.
          </p>
          <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">
            Our auto-scheduling engine uses real-time data and AI logic to assign jobs
            based on distance, time, and workload. Say goodbye to wasted travel and
            underutilized staff — CleanOpsAI ensures every cleaner’s day is optimized.
          </p>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            With smart invoicing, GPS mileage tracking, and performance insights,
            CleanOpsAI helps you reclaim hours, increase profit margins, and deliver
            a seamless experience to both clients and staff.
          </p>
        </motion.div>
      </section>

      {/* ====================== CTA ====================== */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center my-32"
      >
        <h2 className="text-4xl font-bold mb-6">
          Ready to Automate Your Cleaning Business?
        </h2>
        <p className="max-w-xl mx-auto text-[var(--muted)] mb-10">
          Join hundreds of cleaning business owners scaling faster and working smarter with CleanOpsAI.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard" className="btn text-base">
            Get Started Free
          </Link>
          <Link href="/pricing" className="btn-secondary text-base">
            View Pricing
          </Link>
        </div>
      </motion.section>

      <footer className="text-center border-t border-[var(--border)] py-8">
        <p className="text-xs opacity-60">
          © {new Date().getFullYear()} CleanOpsAI. All rights reserved.
        </p>
      </footer>
    </main>
  )
}