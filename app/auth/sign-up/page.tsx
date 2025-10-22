import Link from 'next/link'
import { AuthForm } from '@/components/AuthForm'

export default function SignUpPage() {
  return (
    <div className="grid gap-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Create your account</h1>
        <p className="text-white/70">Start your 14‑day free trial, no card required.</p>
      </div>
      <AuthForm mode="sign-up" />
      <p className="text-white/60 text-sm">
        Already have an account? <Link href="/auth/sign-in" className="underline">Sign in</Link>
      </p>
    </div>
  )
}
