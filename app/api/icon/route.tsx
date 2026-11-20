import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { getStorefront } from "@/lib/storefront"
import { INTER_BOLD_BASE64 } from "./font"

const SIZES = new Set([32, 48, 64, 180, 192, 512])
const interBold = Buffer.from(INTER_BOLD_BASE64, "base64")

/**
 * Browser-tab / home-screen icons.
 *   /api/icon?size=180               → ShopHub logo
 *   /api/icon?store=<slug>&size=64   → the store's first letter on its accent color
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const requested = Number(params.get("size") ?? 64)
  const size = SIZES.has(requested) ? requested : 64
  const slug = params.get("store")
  const radius = Math.round(size * 0.22)

  let body: React.ReactElement
  let bold = false
  if (slug) {
    const store = await getStorefront(slug)
    const letter = (Array.from(store?.store_name.trim() ?? "")[0] ?? "S").toUpperCase()
    // The bundled bold font covers A–Z and 0–9; other scripts use the default font.
    bold = /^[A-Z0-9]$/.test(letter)
    const color = /^#[0-9a-f]{6}$/i.test(store?.accent_color ?? "") ? store!.accent_color : "#303030"
    body = (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: color,
          borderRadius: radius,
          color: "white",
          fontSize: Math.round(size * 0.62),
          fontWeight: 700,
          fontFamily: bold ? "Inter" : undefined,
          paddingBottom: bold ? Math.round(size * 0.02) : 0,
        }}
      >
        {letter}
      </div>
    )
  } else {
    body = (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#36fba1", borderRadius: radius }}>
        <svg viewBox="0 0 32 32" width={size} height={size}>
          <path d="M10 12h12l-1.2 11.2a2 2 0 0 1-2 1.8h-5.6a2 2 0 0 1-2-1.8L10 12Z" fill="#0b3d2c" />
          <path d="M13 12V10.5a3 3 0 0 1 6 0V12" stroke="#0b3d2c" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="m13.5 20 2.2-2.2 1.6 1.6 2.2-2.4" stroke="#36fba1" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  return new ImageResponse(body, {
    width: size,
    height: size,
    fonts: bold ? [{ name: "Inter", data: interBold, weight: 700, style: "normal" }] : undefined,
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  })
}
