import { requireMerchant } from "@/lib/auth"
import type { Product } from "@/lib/types"
import { Page } from "@/components/admin/ui"
import { InventoryTable } from "@/components/admin/inventory-table"

export const metadata = { title: "Inventory" }

export default async function InventoryPage() {
  const { supabase, merchant } = await requireMerchant()
  const { data } = await supabase
    .from("products")
    .select("id, name, sku, quantity, images, status, track_inventory")
    .eq("merchant_id", merchant.id)
    .eq("track_inventory", true)
    .order("quantity", { ascending: true })
  return (
    <Page title="Inventory" subtitle="Products with tracked quantity, lowest stock first.">
      <InventoryTable products={(data ?? []) as Product[]} />
    </Page>
  )
}
