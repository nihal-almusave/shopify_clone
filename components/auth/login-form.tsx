"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(
    params.get("error") === "confirm" ? "That confirmation link is invalid or expired. Try logging in or sign up again." : null,
  )
  const [loading, setLoading] = useState(false)

  const next = /^\/(admin|platform)(\/|$)/.test(params.get("next") ?? "") ? params.get("next")! : "/admin"

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
      <h1 className="font-display text-[34px] leading-tight font-bold tracking-[-0.035em]">Log in</h1>
      <p className="mt-2 text-[15px] text-[#5d6b63]">Continue to your store admin</p>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required className="field py-2.5" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className="field-label" htmlFor="password">Password</label>
            <Link href="/auth/forgot-password" className="text-[13px] font-medium text-[#0b6e4f] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative"><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required className="field py-2.5 pr-12" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-2 grid w-9 place-items-center rounded-lg text-[#68756d] hover:bg-[#f2f3ef] focus-visible:outline-2 focus-visible:outline-[#0b3d2c]">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
        </div>
        {error && <p role="alert" className="rounded-xl border border-[#f3c5c0] bg-[#fef3f2] px-3 py-2.5 text-[13px] text-[#8e0b21]">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary h-11 text-sm">
          {loading && <Loader2 className="size-4 animate-spin" />} Log in
        </button>
      </form>
      <p className="mt-8 text-[13px] text-[#5d6b63]">
        New to ShopHub?{" "}
        <Link href="/auth/signup" className="font-medium text-[#0b6e4f] hover:underline">
          Get started
        </Link>
      </p>
    </>
  )
}
