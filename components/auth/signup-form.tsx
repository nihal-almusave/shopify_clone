"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/format"

export function SignupForm() {
  const router = useRouter()
  const [form, setForm] = useState({ storeName: "", email: "", password: "" })
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const effectiveSlug = slugTouched ? slugify(slug) : slugify(form.storeName)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password.length < 8) return setError("Use at least 8 characters for your password")
    if (!effectiveSlug) return setError("Choose a store URL")
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        data: { store_name: form.storeName.trim(), store_slug: effectiveSlug },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    // Email confirmation disabled in Supabase → a session comes back right away.
    if (data.session) {
      router.push("/admin")
      router.refresh()
    } else {
      router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}`)
    }
  }

  return (
    <>
      <h1 className="font-display text-[34px] leading-tight font-bold tracking-[-0.035em]">Create your store</h1>
      <p className="mt-2 text-[15px] text-[#5d6b63]">Free to start. No credit card required.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <div>
          <label className="field-label" htmlFor="storeName">Store name</label>
          <input
            id="storeName"
            required
            className="field py-2.5"
            placeholder="Northwind Goods"
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="slug">Store URL</label>
          <div className="flex overflow-hidden rounded-xl border border-[#c9cfc7] focus-within:border-[#0b3d2c] focus-within:ring-3 focus-within:ring-[#0b3d2c]/15">
            <span className="flex items-center bg-[#f7f8f5] px-3 text-[13px] text-[#5d6b63]">/store/</span>
            <input
              id="slug"
              className="w-full px-2 py-2 text-[13px] outline-none"
              placeholder="northwind-goods"
              value={slugTouched ? slug : effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value.toLowerCase())
              }}
            />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required className="field py-2.5" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <div className="relative"><input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} className="field py-2.5 pr-12" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-2 grid w-9 place-items-center rounded-lg text-[#68756d] hover:bg-[#f2f3ef] focus-visible:outline-2 focus-visible:outline-[#0b3d2c]">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
          <p className="field-help">At least 8 characters</p>
        </div>
        {error && <p role="alert" className="rounded-xl border border-[#f3c5c0] bg-[#fef3f2] px-3 py-2.5 text-[13px] text-[#8e0b21]">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary h-11 text-sm">
          {loading && <Loader2 className="size-4 animate-spin" />} Create store
        </button>
      </form>
      <p className="mt-8 text-[13px] text-[#5d6b63]">
        Already have a store?{" "}
        <Link href="/auth/login" className="font-medium text-[#0b6e4f] hover:underline">
          Log in
        </Link>
      </p>
    </>
  )
}
