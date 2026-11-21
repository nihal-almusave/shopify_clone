import Link from "next/link"
import { Inbox, Search } from "lucide-react"
import { requireMerchant } from "@/lib/auth"
import { formatDateTime, formatMoney } from "@/lib/format"
import type { Order } from "@/lib/types"
import { Badge, Card, EmptyState, Page, fulfillmentBadge, paymentBadge } from "@/components/admin/ui"
import { cn } from "@/lib/utils"

export const metadata = { title: "Orders" }

const TABS = [
  { key: "all", label: "All" },
  { key: "unfulfilled", label: "Unfulfilled" },
  { key: "unpaid", label: "Unpaid" },
  { key: "open", label: "Open" },
  { key: "archived", label: "Archived" },
]

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  const { tab = "all", q = "" } = await searchParams
  const { supabase, merchant } = await requireMerchant()

  let query = supabase
    .from("orders")
    .select("*, order_items(quantity)")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false })
    .limit(200)
  if (tab === "unfulfilled") query = query.eq("fulfillment_status", "unfulfilled").neq("status", "cancelled")
  if (tab === "unpaid") query = query.eq("payment_status", "pending").neq("status", "cancelled")
  if (tab === "open") query = query.eq("status", "open")
  if (tab === "archived") query = query.eq("status", "archived")
  const term = q.trim().replace(/^#/, "").replace(/[%,()]/g, "")
  if (term) {
    query = /^\d+$/.test(term)
      ? query.eq("order_number", Number(term))
      : query.or(`email.ilike.%${term}%,customer_name.ilike.%${term}%`)
  }
  const { data } = await query
  const orders = (data ?? []) as (Order & { order_items: { quantity: number }[] })[]

  const { count: total } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("merchant_id", merchant.id)

  const href = (t: string) => `/admin/orders?${new URLSearchParams({ ...(t !== "all" ? { tab: t } : {}), ...(q ? { q } : {}) })}`

  return (
    <Page title="Orders">
      {total === 0 ? (
        <Card>
          <EmptyState
            icon={<Inbox className="size-7" />}
            heading="Your orders will show here"
            action={
              <Link href={`/store/${merchant.store_slug}`} target="_blank" className="btn-primary">
                Visit your store
              </Link>
            }
          >
            To get orders, you need to get your store ready and share it with customers.
          </EmptyState>
        </Card>
      ) : (
        <Card flush>
          <div className="flex flex-wrap items-center gap-2 border-b border-[#eceee9] p-2">
            <div className="flex flex-wrap gap-1">
              {TABS.map((t) => (
                <Link
                  key={t.key}
                  href={href(t.key)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[13px] font-medium",
                    tab === t.key ? "bg-[#0b3d2c] text-white" : "text-[#5d6b63] hover:bg-[#f2f3ef]",
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </div>
            <form className="ml-auto flex w-full sm:w-64" action="/admin/orders">
              {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
              <label className="flex w-full items-center gap-2 rounded-full border border-[#d5dad3] bg-white px-3 py-1.5">
                <Search className="size-4 text-[#8a958e]" />
                <input name="q" defaultValue={q} placeholder="Search order #, name or email" className="w-full text-[13px] outline-none" />
              </label>
            </form>
          </div>
          {orders.length === 0 ? (
            <EmptyState heading="No orders found">Try changing the filters or search term.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-[13px]">
                <thead className="border-y border-[#eceee9] bg-[#f7f8f5] text-left text-xs text-[#5d6b63]">
                  <tr>
                    <th className="px-4 py-2 font-medium">Order</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Customer</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                    <th className="px-3 py-2 font-medium">Payment status</th>
                    <th className="px-3 py-2 font-medium">Fulfillment status</th>
                    <th className="px-3 py-2 font-medium">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceee9]">
                  {orders.map((o) => (
                    <tr key={o.id} className={cn("relative hover:bg-[#f7f8f5]", o.status === "cancelled" && "text-[#8a958e]")}>
                      <td className="px-4 py-2.5 font-semibold">
                        <Link href={`/admin/orders/${o.id}`} className="after:absolute after:inset-0">
                          #{o.order_number}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-[#5d6b63]">{formatDateTime(o.created_at)}</td>
                      <td className="px-3 py-2.5">{o.customer_name || o.email}</td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">{formatMoney(o.total_price, o.currency)}</td>
                      <td className="px-3 py-2.5">
                        {o.status === "cancelled" ? <Badge tone="neutral">Cancelled</Badge> : paymentBadge(o.payment_status)}
                      </td>
                      <td className="px-3 py-2.5">{fulfillmentBadge(o.fulfillment_status)}</td>
                      <td className="px-3 py-2.5 text-[#5d6b63]">
                        {(() => { const n = o.order_items.reduce((s, i) => s + i.quantity, 0); return `${n} ${n === 1 ? "item" : "items"}` })()}
                      </td>
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
