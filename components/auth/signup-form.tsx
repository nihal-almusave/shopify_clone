"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/format"

export function SignupForm() {
  const router = useRouter()
  const [form, setForm] = useState({ storeName: "", email: "", password: "" })
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
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
      <h1 className="text-2xl font-bold tracking-tight text-[#303030]">Create your store</h1>
      <p className="mt-1 text-sm text-[#616161]">Free to start. No credit card required.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <div>
          <label className="field-label" htmlFor="storeName">Store name</label>
          <input
            id="storeName"
            required
            className="field py-2"
            placeholder="Northwind Goods"
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="slug">Store URL</label>
          <div className="flex overflow-hidden rounded-lg border border-[#8a8a8a] focus-within:border-[#005bd3] focus-within:ring-2 focus-within:ring-[#005bd3]/30">
            <span className="flex items-center bg-[#f7f7f7] px-3 text-[13px] text-[#616161]">/store/</span>
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
          <input id="email" type="email" autoComplete="email" required className="field py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" required minLength={8} className="field py-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <p className="field-help">At least 8 characters</p>
        </div>
        {error && <p className="rounded-lg bg-[#fee9e8] px-3 py-2 text-[13px] text-[#8e0b21]">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary h-10 text-sm">
          {loading && <Loader2 className="size-4 animate-spin" />} Create store
        </button>
      </form>
      <p className="mt-6 text-center text-[13px] text-[#616161]">
        Already have a store?{" "}
        <Link href="/auth/login" className="font-medium text-[#005bd3] hover:underline">
          Log in
        </Link>
      </p>
    </>
  )
}
