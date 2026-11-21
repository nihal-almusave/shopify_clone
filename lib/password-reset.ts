"use server"

import { headers } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { getSiteUrl } from "@/lib/site"

/**
 * Sends the password-reset email from the server using the implicit flow.
 * The emailed link then carries a one-time session itself, so it works on any
 * device. The default browser (PKCE) flow only works in the browser that asked.
 */
export async function requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const address = email.trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) return { ok: false, error: "Enter a valid email address." }

  const { url, key } = getSupabaseEnv()
  const supabase = createClient(url, key, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const site = getSiteUrl(await headers())
  const { error } = await supabase.auth.resetPasswordForEmail(address, { redirectTo: `${site}/auth/reset` })
  if (error) {
    if (/rate limit/i.test(error.message)) return { ok: false, error: "Too many reset emails were sent recently. Wait a few minutes and try again." }
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
