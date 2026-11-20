import "server-only"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { STOREFRONT_COLUMNS, type Storefront } from "@/lib/types"

export const getStorefront = cache(async (slug: string) => {
  const supabase = await createClient()
  const { data } = await supabase.from("merchants").select(STOREFRONT_COLUMNS).eq("store_slug", slug).maybeSingle<Storefront>()
  return data
})

export function stripeEnabled() {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.SUPABASE_SERVICE_ROLE_KEY
}
