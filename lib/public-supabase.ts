import "server-only"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseEnv } from "@/lib/supabase/env"

/** Cookie-less anonymous client for public data in sitemaps and metadata. */
export function publicSupabase() {
  const { url, key } = getSupabaseEnv()
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
