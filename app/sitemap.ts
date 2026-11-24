import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"
import { publicSupabase } from "@/lib/public-supabase"

export const revalidate = 3600

/** Landing page, sign-up, every storefront and every active product. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/auth/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ]
  try {
    const supabase = publicSupabase()
    const [{ data: stores }, { data: products }] = await Promise.all([
      supabase.from("merchants").select("id, store_slug, created_at"),
      supabase.from("products").select("id, merchant_id, updated_at").eq("status", "active").limit(5000),
    ])
    const slugById = new Map((stores ?? []).map((s) => [s.id, s.store_slug as string]))
    for (const s of stores ?? []) {
      entries.push({ url: `${SITE_URL}/store/${s.store_slug}`, lastModified: new Date(s.created_at), changeFrequency: "daily", priority: 0.7 })
    }
    for (const p of products ?? []) {
      const slug = slugById.get(p.merchant_id)
      if (slug) entries.push({ url: `${SITE_URL}/store/${slug}/products/${p.id}`, lastModified: new Date(p.updated_at), changeFrequency: "weekly", priority: 0.6 })
    }
  } catch {
    // The sitemap still lists the main pages if the database is unreachable.
  }
  return entries
}
