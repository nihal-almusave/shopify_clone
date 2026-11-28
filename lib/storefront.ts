import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { STOREFRONT_COLUMNS, type Storefront } from "@/lib/types"
import type { ThemeTokens } from "@/lib/themes"

export const getStorefront = cache(async (slug: string) => {
  const supabase = await createClient()
  const { data } = await supabase.from("merchants").select(STOREFRONT_COLUMNS).eq("store_slug", slug).maybeSingle<Storefront>()
  return data
})

export const getStoreTheme = cache(async (themeId: string | null) => {
  if (!themeId) return null
  const supabase = await createClient()
  // RLS allows the store's own uploaded theme as well as published ones
  const { data } = await supabase.from("themes").select("tokens").eq("id", themeId).maybeSingle()
  return (data?.tokens as ThemeTokens | undefined) ?? null
})

/** Any theme the current viewer may read: published ones, plus drafts for platform admins (enforced by RLS). */
export const getThemeForPreview = cache(async (themeId: string) => {
  const supabase = await createClient()
  const { data } = await supabase.from("themes").select("id, name, tokens").eq("id", themeId).maybeSingle()
  return (data as { id: string; name: string; tokens: ThemeTokens } | null) ?? null
})

/**
 * The theme this visitor should see: a preview chosen with /api/theme-preview (this browser only),
 * otherwise the store's published theme.
 */
export const resolveStoreTheme = cache(async (store: Pick<Storefront, "theme_id">) => {
  const previewId = (await cookies()).get("sh_theme_preview")?.value
  if (previewId === "default") return { tokens: null, preview: { id: null, name: "ShopHub default" } }
  if (previewId && /^[0-9a-f-]{36}$/i.test(previewId)) {
    const theme = await getThemeForPreview(previewId)
    if (theme) return { tokens: theme.tokens, preview: { id: theme.id, name: theme.name } }
  }
  return { tokens: await getStoreTheme(store.theme_id), preview: null as null | { id: string | null; name: string } }
})

export function stripeEnabled() {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.SUPABASE_SERVICE_ROLE_KEY
}
