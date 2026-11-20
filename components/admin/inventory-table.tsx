"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Package } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"
import { Card, EmptyState, Thumbnail } from "@/components/admin/ui"

export function InventoryTable({ products }: { products: Product[] }) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(products.map((p) => [p.id, String(p.quantity)])),
  )
  const [saving, setSaving] = useState(false)
  const changed = products.filter((p) => String(p.quantity) !== values[p.id])

  const save = async () => {
    setSaving(true)
    const supabase = createClient()
    const results = await Promise.all(
      changed.map((p) =>
        supabase.from("products").update({ quantity: Number.parseInt(values[p.id] || "0", 10) || 0 }).eq("id", p.id),
      ),
    )
    setSaving(false)
    const failed = results.find((r) => r.error)
    if (failed?.error) return toast.error(failed.error.message)
    toast.success(`Updated ${changed.length} product${changed.length === 1 ? "" : "s"}`)
    router.refresh()
  }

  if (products.length === 0)
    return (
      <Card>
        <EmptyState icon={<Package className="size-7" />} heading="No tracked inventory">
          Turn on “Track quantity” for a product to manage its stock here.
        </EmptyState>
      </Card>
    )

  return (
    <Card flush>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-[13px]">
          <thead className="bg-[#f7f7f7] text-left text-xs text-[#616161]">
            <tr>
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="w-40 px-4 py-2 text-right font-medium">Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebebeb]">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 font-semibold hover:underline">
                    <Thumbnail src={p.images?.[0]} alt={p.name} size={36} />
                    {p.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-[#616161]">{p.sku || "No SKU"}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    aria-label={`Available quantity for ${p.name}`}
                    className="field ml-auto w-28 text-right"
                    value={values[p.id]}
                    onChange={(e) => setValues((v) => ({ ...v, [p.id]: e.target.value }))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end border-t border-[#ebebeb] p-3">
        <button className="btn-primary" disabled={!changed.length || saving} onClick={save}>
          Save{changed.length ? ` (${changed.length})` : ""}
        </button>
      </div>
    </Card>
  )
}
