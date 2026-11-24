"use client"

import Link from "next/link"
import { useState } from "react"
import { Loader2, MailCheck } from "lucide-react"
import { requestPasswordReset } from "@/lib/password-reset"

export function ForgotPasswordForm({ expired = false }: { expired?: boolean }) {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(
    expired ? "That reset link has expired or was already used. Request a new one below." : null,
  )
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await requestPasswordReset(email)
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setSent(true)
  }

  if (sent)
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-[#dcfce9] text-[#0b3d2c]">
          <MailCheck className="size-7" />
        </div>
        <h1 className="font-display text-[34px] leading-tight font-bold tracking-[-0.035em]">Check your email</h1>
        <p className="mt-2 text-sm text-[#5d6b63]">
          If an account exists for <strong className="text-[#12201a]">{email}</strong>, we sent a link to reset your password.
          It expires in one hour.
        </p>
        <p className="mt-4 text-[13px] text-[#5d6b63]">
          Didn’t get it? Check your spam folder, or{" "}
          <button className="font-medium text-[#0b6e4f] hover:underline" onClick={() => setSent(false)}>
            try another email
          </button>
          .
        </p>
        <Link href="/auth/login" className="btn-secondary mt-6 h-11 w-full text-sm">
          Back to log in
        </Link>
      </div>
    )

  return (
    <>
      <h1 className="font-display text-[34px] leading-tight font-bold tracking-[-0.035em]">Reset your password</h1>
      <p className="mt-1 text-sm text-[#5d6b63]">Enter the email you use for your store. We’ll send you a link to choose a new password.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required autoFocus className="field py-2.5" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {error && <p className="rounded-lg bg-[#fee9e8] px-3 py-2 text-[13px] text-[#8e0b21]">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-2 h-11 text-sm">
          {loading && <Loader2 className="size-4 animate-spin" />} Send reset link
        </button>
      </form>
      <p className="mt-8 text-[13px] text-[#5d6b63]">
        Remembered it?{" "}
        <Link href="/auth/login" className="font-medium text-[#0b6e4f] hover:underline">
          Log in
        </Link>
      </p>
    </>
  )
}
