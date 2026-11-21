"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export function UpdatePasswordForm({ email }: { email: string }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) return setError("Use at least 8 characters.")
    if (password !== confirm) return setError("The two passwords don’t match.")
    setLoading(true)
    const { error } = await createClient().auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(/different from the old/i.test(error.message) ? "Choose a password you haven’t used before." : error.message)
      return
    }
    toast.success("Password updated")
    router.push("/admin")
    router.refresh()
  }

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight">Choose a new password</h1>
      <p className="mt-1 text-sm text-[#5d6b63]">For {email}</p>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <div>
          <label className="field-label" htmlFor="password">New password</label>
          <div className="relative">
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              autoFocus
              minLength={8}
              className="field py-2 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-2 grid place-items-center px-1 text-[#5d6b63]"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="field-help">At least 8 characters</p>
        </div>
        <div>
          <label className="field-label" htmlFor="confirm">Confirm new password</label>
          <input id="confirm" type={show ? "text" : "password"} autoComplete="new-password" required className="field py-2" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <p className="rounded-lg bg-[#fee9e8] px-3 py-2 text-[13px] text-[#8e0b21]">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary h-10 text-sm">
          {loading && <Loader2 className="size-4 animate-spin" />} Update password
        </button>
      </form>
    </>
  )
}
