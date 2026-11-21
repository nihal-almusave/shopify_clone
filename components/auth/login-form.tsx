"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(
    params.get("error") === "confirm" ? "That confirmation link is invalid or expired. Try logging in or sign up again." : null,
  )
  const [loading, setLoading] = useState(false)

  const next = params.get("next")?.startsWith("/admin") ? params.get("next")! : "/admin"

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message === "Email not confirmed" ? "Confirm your email first. Check your inbox for the link." : error.message)
      setLoading(false)
      return
    }
    router.push(next)
    router.refresh()
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-[#12201a]">Log in</h1>
      <p className="mt-1 text-sm text-[#5d6b63]">Continue to your store admin</p>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required className="field py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className="field-label" htmlFor="password">Password</label>
            <Link href="/auth/forgot-password" className="text-[13px] font-medium text-[#0b6e4f] hover:underline">
              Forgot password?
            </Link>
          </div>
          <input id="password" type="password" autoComplete="current-password" required className="field py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="rounded-lg bg-[#fee9e8] px-3 py-2 text-[13px] text-[#8e0b21]">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary h-10 text-sm">
          {loading && <Loader2 className="size-4 animate-spin" />} Log in
        </button>
      </form>
      <p className="mt-6 text-center text-[13px] text-[#5d6b63]">
        New to ShopHub?{" "}
        <Link href="/auth/signup" className="font-medium text-[#0b6e4f] hover:underline">
          Get started
        </Link>
      </p>
    </>
  )
}
