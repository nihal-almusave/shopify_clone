import "server-only"
import { cache } from "react"
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
  const { data } = await supabase.from("themes").select("tokens").eq("id", themeId).eq("is_published", true).maybeSingle()
  return (data?.tokens as ThemeTokens | undefined) ?? null
})

export function stripeEnabled() {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.SUPABASE_SERVICE_ROLE_KEY
}
