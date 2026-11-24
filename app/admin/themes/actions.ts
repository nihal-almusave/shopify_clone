"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { requireMerchant } from "@/lib/auth"

/** Publishes a theme on the signed-in merchant's store (null = ShopHub default) and ends any preview. */
export async function publishTheme(themeId: string | null): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, merchant } = await requireMerchant()
  if (themeId) {
    const { data } = await supabase
      .from("themes")
      .select("id")
      .eq("id", themeId)
      .or(`is_published.eq.true,owner_id.eq.${merchant.id}`)
      .maybeSingle()
    if (!data) return { ok: false, error: "That theme isn’t available any more." }
  }
  const { error } = await supabase.from("merchants").update({ theme_id: themeId }).eq("id", merchant.id)
  if (error) return { ok: false, error: error.message }
  ;(await cookies()).delete("sh_theme_preview")
  revalidatePath("/admin/themes")
  revalidatePath(`/store/${merchant.store_slug}`, "layout")
  return { ok: true }
}
