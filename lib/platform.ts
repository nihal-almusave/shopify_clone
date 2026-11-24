import "server-only"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/** Platform admin pages: signed in AND listed in platform_admins. Everyone else gets a 404. */
export async function requirePlatformAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/platform")
  const { data: isAdmin } = await supabase.rpc("is_platform_admin")
  if (!isAdmin) notFound()
  return { supabase, user }
}

export type PlatformStats = {
  days: number
  totals: { stores: number; new_stores: number; active_stores: number; products: number; orders: number; views: number; visitors: number }
  sales_by_currency: { currency: string; sales: number; orders: number }[]
  daily: {
    day: string
    new_stores: number
    orders: number
    views: number
    visitors: number
    ev_login: number
    ev_product_created: number
    ev_product_updated: number
    ev_order_fulfilled: number
    ev_settings_updated: number
  }[]
  stores: {
    store_name: string
    store_slug: string
    currency: string
    created_at: string
    theme_name: string | null
    products: number
    orders: number
    sales: number
    views: number
    visitors: number
    last_active: string
  }[]
  themes: { name: string; stores: number }[]
}
