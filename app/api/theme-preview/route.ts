import { NextResponse, type NextRequest } from "next/server"

export const PREVIEW_COOKIE = "sh_theme_preview"

/**
 * Starts or ends a theme preview in this browser only (like Shopify's "Preview").
 *   /api/theme-preview?store=<slug>&theme=<id|default>   start
 *   /api/theme-preview?store=<slug>&exit=1                stop
 */
export function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams
  const store = p.get("store") ?? ""
  if (!/^[a-z0-9-]+$/.test(store)) return NextResponse.json({ error: "Unknown store" }, { status: 400 })
  const res = NextResponse.redirect(new URL(`/store/${store}`, request.url))
  const theme = p.get("theme") ?? ""
  if (p.get("exit") || !(theme === "default" || /^[0-9a-f-]{36}$/i.test(theme))) {
    res.cookies.delete(PREVIEW_COOKIE)
  } else {
    res.cookies.set(PREVIEW_COOKIE, theme, { path: "/", maxAge: 60 * 60, sameSite: "lax", httpOnly: true, secure: request.nextUrl.protocol === "https:" })
  }
  return res
}
