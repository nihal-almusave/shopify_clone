import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("[v0] Missing Supabase environment variables on server")
    console.error("[v0] NEXT_PUBLIC_SUPABASE_URL:", url ? "✓ set" : "✗ missing")
    console.error("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:", key ? "✓ set" : "✗ missing")
    throw new Error("Supabase environment variables are missing. Please check your environment configuration.")
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  })
}
