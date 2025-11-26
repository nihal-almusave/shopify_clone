import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("[v0] Missing Supabase environment variables")
    console.error("[v0] NEXT_PUBLIC_SUPABASE_URL:", url ? "✓ set" : "✗ missing")
    console.error("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:", key ? "✓ set" : "✗ missing")
    throw new Error(
      "Supabase environment variables are missing. Please check your .env.local file or Vercel environment variables.",
    )
  }

  return createBrowserClient(url, key)
}
