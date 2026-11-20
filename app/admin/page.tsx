import Link from "next/link"
import { CheckCircle2, Circle, ExternalLink, Inbox } from "lucide-react"
import { requireMerchant } from "@/lib/auth"
import { formatDateTime, formatMoney } from "@/lib/format"
import type { Order } from "@/lib/types"
import { Card, EmptyState, Page, fulfillmentBadge, paymentBadge } from "@/components/admin/ui"
import { SalesChart } from "@/components/admin/sales-chart"

export const metadata = { title: "Home" }

const DAYS = 30

export default async function AdminHome() {
  const { supabase, merchant } = await requireMerchant()
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - (DAYS - 1))

  const [{ data: orders }, { count: productCount }, { data: recent }] = await Promise.all([
    supabase
      .from("orders")
      .select("total_price, created_at, status")
      .eq("merchant_id", merchant.id)
      .neq("status", "cancelled")
      .gte("created_at", since.toISOString()),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("merchant_id", merchant.id),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, email, total_price, currency, payment_status, fulfillment_status, created_at")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })
      .limit(6),
  ])

  const byDay = new Map<string, number>()
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    byDay.set(d.toISOString().slice(0, 10), 0)
  }
  let total = 0
  for (const o of orders ?? []) {
    const key = new Date(o.created_at).toISOString().slice(0, 10)
    const amount = Number(o.total_price)
    total += amount
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + amount)
  }
  const chart = [...byDay.entries()].map(([date, sales]) => ({
    date,
    sales: Math.round(sales * 100) / 100,
    label: new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }))
  const orderCount = orders?.length ?? 0
  const aov = orderCount ? total / orderCount : 0

  const steps = [
    { done: (productCount ?? 0) > 0, label: "Add your first product", href: "/admin/products/new" },
    { done: !!merchant.logo_url || !!merchant.banner_url, label: "Customize your store’s look", href: "/admin/settings" },
    { done: merchant.shipping_rate > 0 || merchant.free_shipping_threshold != null, label: "Set shipping rates", href: "/admin/settings#shipping" },
    { done: orderCount > 0 || (recent?.length ?? 0) > 0, label: "Place a test order", href: `/store/${merchant.store_slug}` },
  ]
  const completed = steps.filter((s) => s.done).length

  return (
    <Page
      title={`Good to see you, ${merchant.store_name}`}
      actions={
        <Link href={`/store/${merchant.store_slug}`} target="_blank" className="btn-secondary">
          View store <ExternalLink className="size-3.5" />
        </Link>
      }
    >
      <div className="grid gap-4">
        {completed < steps.length && (
          <Card title="Setup guide" action={<span className="text-xs text-[#616161]">{completed} of {steps.length} tasks complete</span>}>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#ebebeb]">
              <div className="h-full rounded-full bg-[#303030]" style={{ width: `${(completed / steps.length) * 100}%` }} />
            </div>
            <ul className="grid gap-1">
              {steps.map((s) => (
                <li key={s.label}>
                  <Link href={s.href} className="flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] hover:bg-[#f7f7f7]">
                    {s.done ? (
                      <CheckCircle2 className="size-5 fill-[#303030] text-white" />
                    ) : (
                      <Circle className="size-5 text-[#8a8a8a] [stroke-dasharray:3_2]" />
                    )}
                    <span className={s.done ? "text-[#616161] line-through" : "font-medium"}>{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card>
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Total sales" value={formatMoney(total, merchant.currency)} />
            <Stat label="Orders" value={orderCount.toLocaleString()} />
            <Stat label="Average order value" value={formatMoney(aov, merchant.currency)} />
          </div>
          <p className="mb-1 text-xs text-[#616161]">Sales over the last {DAYS} days</p>
          <SalesChart data={chart} currency={merchant.currency} />
        </Card>

        <Card title="Recent orders" flush action={<Link href="/admin/orders" className="text-[13px] font-medium text-[#005bd3] hover:underline">View all</Link>}>
          {recent && recent.length > 0 ? (
            <ul className="divide-y divide-[#ebebeb] border-t border-[#ebebeb]">
              {(recent as Order[]).map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-[13px] hover:bg-[#f7f7f7]">
                    <span className="w-16 font-semibold">#{o.order_number}</span>
                    <span className="min-w-0 flex-1 truncate">{o.customer_name || o.email}</span>
                    <span className="hidden text-[#616161] sm:inline">{formatDateTime(o.created_at)}</span>
                    {paymentBadge(o.payment_status)}
                    {fulfillmentBadge(o.fulfillment_status)}
                    <span className="w-24 text-right font-medium">{formatMoney(o.total_price, o.currency)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Inbox className="size-7" />} heading="No orders yet">
              When customers buy from your store, their orders show up here.
            </EmptyState>
          )}
        </Card>
      </div>
    </Page>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#616161] underline decoration-dotted decoration-[#b5b5b5] underline-offset-4">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
    </div>
  )
}
