import Link from "next/link"
import { Check, Inbox, PackageOpen } from "lucide-react"
import { requireMerchant } from "@/lib/auth"
import { formatDateTime, formatMoney } from "@/lib/format"
import type { Order, Product } from "@/lib/types"
import { Card, EmptyState, Page, Thumbnail, fulfillmentBadge, paymentBadge } from "@/components/admin/ui"
import { SalesChart } from "@/components/admin/sales-chart"
import { StoreLinkCard } from "@/components/admin/store-link-card"
import { cn } from "@/lib/utils"

export const metadata = { title: "Home" }

const DAYS = 30

export default async function AdminHome() {
  const { supabase, merchant } = await requireMerchant()

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (DAYS - 1))
  const prevStart = new Date(start)
  prevStart.setDate(prevStart.getDate() - DAYS)

  const [{ data: orders }, { count: productCount }, { data: recent }, { count: toFulfill }, { data: lowStock }] = await Promise.all([
    supabase
      .from("orders")
      .select("total_price, created_at")
      .eq("merchant_id", merchant.id)
      .neq("status", "cancelled")
      .gte("created_at", prevStart.toISOString()),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("merchant_id", merchant.id),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, email, total_price, currency, payment_status, fulfillment_status, status, created_at")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("merchant_id", merchant.id)
      .eq("fulfillment_status", "unfulfilled")
      .neq("status", "cancelled"),
    supabase
      .from("products")
      .select("id, name, quantity, images")
      .eq("merchant_id", merchant.id)
      .eq("track_inventory", true)
      .neq("status", "archived")
      .lte("quantity", 5)
      .order("quantity", { ascending: true })
      .limit(5),
  ])

  // Bucket into this period (chart + totals) and the period before (comparison)
  const byDay = new Map<string, number>()
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    byDay.set(d.toISOString().slice(0, 10), 0)
  }
  let sales = 0
  let count = 0
  let prevSales = 0
  let prevCount = 0
  for (const o of orders ?? []) {
    const created = new Date(o.created_at)
    const amount = Number(o.total_price)
    if (created >= start) {
      sales += amount
      count += 1
      const key = created.toISOString().slice(0, 10)
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + amount)
    } else {
      prevSales += amount
      prevCount += 1
    }
  }
  const chart = [...byDay.entries()].map(([date, value]) => ({
    date,
    sales: Math.round(value * 100) / 100,
    label: new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }))
  const aov = count ? sales / count : 0
  const prevAov = prevCount ? prevSales / prevCount : 0
  const money = (v: number) => formatMoney(v, merchant.currency)

  const steps = [
    { done: (productCount ?? 0) > 0, label: "Add a product", href: "/admin/products/new" },
    { done: !!merchant.logo_url || !!merchant.banner_url, label: "Add your logo or cover", href: "/admin/settings" },
    { done: merchant.shipping_rate > 0 || merchant.free_shipping_threshold != null, label: "Set shipping", href: "/admin/settings#shipping" },
    { done: (recent?.length ?? 0) > 0, label: "Get your first order", href: `/store/${merchant.store_slug}` },
  ]
  const completed = steps.filter((s) => s.done).length

  return (
    <Page title={merchant.store_name} subtitle={`Last ${DAYS} days`}>
      <div className="grid gap-4">
        {completed < steps.length && (
          <section className="surface overflow-hidden">
            <div className="flex flex-wrap items-end justify-between gap-2 px-5 pt-5">
              <div>
                <h2 className="font-display text-xl font-bold tracking-[-0.02em]">Get your store ready</h2>
                <p className="text-sm text-[#5d6b63]">
                  {completed} of {steps.length} done
                </p>
              </div>
              <div className="h-2 w-40 overflow-hidden rounded-full bg-[#eceee9]" aria-hidden>
                <div className="h-full rounded-full bg-[#36fba1]" style={{ width: `${(completed / steps.length) * 100}%` }} />
              </div>
            </div>
            <ol className="mt-4 grid border-t border-[#eceee9] sm:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.label} className="border-[#eceee9] max-sm:border-b sm:border-r sm:last:border-r-0">
                  <Link href={s.href} className="flex items-center gap-3 px-5 py-4 text-sm hover:bg-[#f7f8f5]">
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                        s.done ? "bg-[#0b3d2c] text-white" : "text-[#5d6b63] ring-1 ring-[#c9cfc7] ring-inset",
                      )}
                    >
                      {s.done ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <span className={s.done ? "text-[#5d6b63] line-through" : "font-medium"}>{s.label}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="surface grid grid-cols-2 lg:grid-cols-4">
          <Metric label="Sales" value={money(sales)} now={sales} before={prevSales} />
          <Metric label="Orders" value={count.toLocaleString()} now={count} before={prevCount} />
          <Metric label="Average order" value={money(aov)} now={aov} before={prevAov} />
          <Link href="/admin/orders?tab=unfulfilled" className="group border-l border-[#eceee9] p-5 max-lg:border-t">
            <p className="text-[13px] text-[#5d6b63]">Ready to ship</p>
            <p className="mt-1 font-display text-[clamp(1.25rem,5.2vw,1.75rem)] leading-none font-bold tracking-[-0.03em]">{toFulfill ?? 0}</p>
            <p className="mt-2 text-xs font-medium text-[#0b6e4f] group-hover:underline">{(toFulfill ?? 0) > 0 ? "Fulfill orders" : "All caught up"}</p>
          </Link>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
          <Card title="Sales over time">
            <SalesChart data={chart} currency={merchant.currency} />
          </Card>
          <StoreLinkCard slug={merchant.store_slug} name={merchant.store_name} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
          <Card
            title="Recent orders"
            flush
            action={
              <Link href="/admin/orders" className="text-[13px] font-medium text-[#0b6e4f] hover:underline">
                View all
              </Link>
            }
          >
            {recent && recent.length > 0 ? (
              <ul className="divide-y divide-[#eceee9] border-t border-[#eceee9]">
                {(recent as Order[]).map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-[13px] hover:bg-[#f7f8f5]">
                      <span className="w-14 font-semibold">#{o.order_number}</span>
                      <span className="min-w-0 flex-1 truncate">{o.customer_name || o.email}</span>
                      <span className="hidden text-[#5d6b63] md:inline">{formatDateTime(o.created_at)}</span>
                      {paymentBadge(o.payment_status)}
                      {fulfillmentBadge(o.fulfillment_status)}
                      <span className="w-24 text-right font-medium">{formatMoney(o.total_price, o.currency)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={<Inbox className="size-7" />} heading="No orders yet">
                Share your store link. When someone buys, the order shows up here.
              </EmptyState>
            )}
          </Card>

          <Card
            title="Running low"
            flush
            action={
              <Link href="/admin/products/inventory" className="text-[13px] font-medium text-[#0b6e4f] hover:underline">
                Inventory
              </Link>
            }
          >
            {lowStock && lowStock.length > 0 ? (
              <ul className="divide-y divide-[#eceee9] border-t border-[#eceee9]">
                {(lowStock as Pick<Product, "id" | "name" | "quantity" | "images">[]).map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 px-5 py-2.5 text-[13px] hover:bg-[#f7f8f5]">
                      <Thumbnail src={p.images?.[0]} alt={p.name} size={36} />
                      <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", p.quantity <= 0 ? "bg-[#fee9e8] text-[#8e0b21]" : "bg-[#fff1d6] text-[#7a4b00]")}>
                        {p.quantity <= 0 ? "Sold out" : `${p.quantity} left`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center px-5 py-10 text-center text-sm text-[#5d6b63]">
                <PackageOpen className="mb-2 size-6 text-[#0b3d2c]" />
                Nothing is running low.
              </div>
            )}
          </Card>
        </div>
      </div>
    </Page>
  )
}

function Metric({ label, value, now, before }: { label: string; value: string; now: number; before: number }) {
  let change: React.ReactNode = <span className="text-[#8a958e]">No earlier data</span>
  if (before > 0) {
    const pct = ((now - before) / before) * 100
    const up = pct >= 0
    change = (
      <span className={up ? "text-[#0b6e4f]" : "text-[#b42318]"}>
        {up ? "▲" : "▼"} {Math.abs(pct).toFixed(0)}% vs previous {DAYS} days
      </span>
    )
  } else if (now > 0) {
    change = <span className="text-[#0b6e4f]">New this period</span>
  }
  return (
    <div className="min-w-0 border-[#eceee9] p-4 sm:p-5 [&:nth-child(2)]:border-l [&:nth-child(3)]:max-lg:border-t [&:nth-child(3)]:lg:border-l">
      <p className="text-[13px] text-[#5d6b63]">{label}</p>
      <p className="mt-1 font-display text-[clamp(1.25rem,5.2vw,1.75rem)] leading-none font-bold tracking-[-0.03em] break-words">{value}</p>
      <p className="mt-2 text-xs font-medium">{change}</p>
    </div>
  )
}
