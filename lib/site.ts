/** Absolute site URL for redirects (Stripe, auth emails). */
export function getSiteUrl(headersList?: Headers) {
  const env = process.env.NEXT_PUBLIC_SITE_URL
  if (env) return env.replace(/\/$/, "")
  const host = headersList?.get("x-forwarded-host") || headersList?.get("host")
  if (host) {
    const proto = headersList?.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https")
    return `${proto}://${host}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

/** Canonical public URL for SEO (sitemap, canonical links, Open Graph). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://shophub-business.vercel.app").replace(/\/$/, "")

export const SITE_DESCRIPTION =
  "Create your online store for free with ShopHub. Add products, take orders with cash on delivery, bKash or bank transfer, and manage everything from one simple admin. Built for small businesses in Bangladesh and beyond."
