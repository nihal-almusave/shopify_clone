import Link from "next/link"
import { Plus, Search, Tag } from "lucide-react"
import { requireMerchant } from "@/lib/auth"
import { formatMoney } from "@/lib/format"
import type { Product } from "@/lib/types"
import { Card, EmptyState, Page, Thumbnail, productStatusBadge } from "@/components/admin/ui"
import { cn } from "@/lib/utils"

export const metadata = { title: "Products" }

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "archived", label: "Archived" },
]

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q = "", status = "all" } = await searchParams
  const { supabase, merchant } = await requireMerchant()

  let query = supabase
    .from("products")
    .select("*")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false })
  if (status !== "all") query = query.eq("status", status)
  if (q.trim()) query = query.or(`name.ilike.%${q.trim().replace(/[%,()]/g, "")}%,sku.ilike.%${q.trim().replace(/[%,()]/g, "")}%`)
  const { data } = await query
  const products = (data ?? []) as Product[]

  const { count: totalCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("merchant_id", merchant.id)

  const href = (s: string) => `/admin/products?${new URLSearchParams({ ...(q ? { q } : {}), ...(s !== "all" ? { status: s } : {}) })}`

  return (
    <Page
      title="Products"
      actions={
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="size-4" /> Add product
        </Link>
      }
    >
      {totalCount === 0 ? (
        <Card>
          <EmptyState
            icon={<Tag className="size-7" />}
            heading="Add your products"
            action={
              <Link href="/admin/products/new" className="btn-primary">
                <Plus className="size-4" /> Add product
              </Link>
            }
          >
            Start by stocking your store with products your customers will love.
          </EmptyState>
        </Card>
      ) : (
        <Card flush>
          <div className="flex flex-wrap items-center gap-2 border-b border-[#ebebeb] p-2">
            <div className="flex gap-1">
              {TABS.map((t) => (
                <Link
                  key={t.key}
                  href={href(t.key)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[13px] font-medium",
                    status === t.key ? "bg-[#ebebeb] text-[#303030]" : "text-[#616161] hover:bg-[#f1f1f1]",
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </div>
            <form className="ml-auto flex w-full items-center sm:w-64" action="/admin/products">
              {status !== "all" && <input type="hidden" name="status" value={status} />}
              <label className="flex w-full items-center gap-2 rounded-lg border border-[#d4d4d4] px-2.5 py-1">
                <Search className="size-4 text-[#8a8a8a]" />
                <input name="q" defaultValue={q} placeholder="Search products" className="w-full text-[13px] outline-none" />
              </label>
            </form>
          </div>

          {products.length === 0 ? (
            <EmptyState heading="No products found">Try changing the filters or search term.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[13px]">
                <thead className="bg-[#f7f7f7] text-left text-xs text-[#616161]">
                  <tr>
                    <th className="px-4 py-2 font-medium">Product</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Inventory</th>
                    <th className="px-3 py-2 font-medium">Price</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Vendor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebebeb]">
                  {products.map((p) => (
                    <tr key={p.id} className="group hover:bg-[#f7f7f7]">
                      <td className="px-4 py-2">
                        <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 font-semibold">
                          <Thumbnail src={p.images?.[0]} alt={p.name} />
                          <span className="group-hover:underline">{p.name}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-2">{productStatusBadge(p.status)}</td>
                      <td className="px-3 py-2">
                        {p.track_inventory ? (
                          <span className={p.quantity <= 0 ? "text-[#8e0b21]" : "text-[#616161]"}>
                            {p.quantity} in stock
                          </span>
                        ) : (
                          <span className="text-[#8a8a8a]">Inventory not tracked</span>
                        )}
                      </td>
                      <td className="px-3 py-2">{formatMoney(p.price, merchant.currency)}</td>
                      <td className="px-3 py-2 text-[#616161]">{p.category || "—"}</td>
                      <td className="px-3 py-2 text-[#616161]">{p.vendor || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </Page>
  )
}
