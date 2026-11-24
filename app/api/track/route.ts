import { createHash } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseEnv } from "@/lib/supabase/env"

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|monitor/i

/**
 * Anonymous storefront page views. The visitor id is a hash of (day, IP, user agent, store, secret salt):
 * it changes every day, can't be reversed, and the IP itself is never stored.
 */
export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? ""
  if (!ua || BOTS.test(ua)) return new NextResponse(null, { status: 204 })

  let slug = ""
  let path = "/"
  try {
    const body = await request.json()
    slug = String(body.slug ?? "").slice(0, 80)
    path = String(body.path ?? "/").slice(0, 300)
  } catch {
    return new NextResponse(null, { status: 204 })
  }
  if (!/^[a-z0-9-]+$/.test(slug)) return new NextResponse(null, { status: 204 })

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown"
  const day = new Date().toISOString().slice(0, 10)
  const salt = process.env.TRACKING_SALT || process.env.NEXT_PUBLIC_SUPABASE_URL || "shophub"
  const visitor = createHash("sha256").update(`${day}|${ip}|${ua}|${slug}|${salt}`).digest("hex")

  const { url, key } = getSupabaseEnv()
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  await supabase.rpc("track_page_view", { p_store_slug: slug, p_path: path, p_visitor_hash: visitor })
  return new NextResponse(null, { status: 204 })
}
