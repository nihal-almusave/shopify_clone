import Link from "next/link"
import { requirePlatformAdmin, type PlatformStats } from "@/lib/platform"
import { formatDate, formatMoney } from "@/lib/format"
import { ActivityChart, DailyBars, TrafficChart } from "@/components/platform/charts"
import { Page } from "@/components/admin/ui"
import { cn } from "@/lib/utils"

export const metadata = { title: "Overview" }
export const dynamic = "force-dynamic"

const RANGES = [7, 30, 90]

export default async function PlatformOverview({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: raw } = await searchParams
  const days = RANGES.includes(Number(raw)) ? Number(raw) : 30
  const { supabase } = await requirePlatformAdmin()
  const { data, error } = await supabase.rpc("platform_stats", { p_days: days })
  if (error || !data) throw new Error(error?.message ?? "Could not load platform stats")
  const s = data as PlatformStats
  const t = s.totals
  const conversion = t.visitors > 0 ? (t.orders / t.visitors) * 100 : null
  const maxTheme = Math.max(1, ...s.themes.map((x) => x.stores))

  return (
    <Page
      title="Platform overview"
      subtitle={`How ShopHub is being used, last ${days} days`}
      actions={
        <div className="flex rounded-full bg-white p-1 ring-1 ring-[#e3e6df]" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/platform?days=${r}`}
              aria-current={r === days ? "true" : undefined}
              className={cn("rounded-full px-3 py-1.5 text-[13px] font-medium", r === days ? "bg-[#0b3d2c] text-white" : "text-[#3d4a43] hover:bg-[#f2f3ef]")}
            >
              {r} days
            </Link>
          ))}
        </div>
      }
    >
      <div className="grid gap-4">
        <section className="surface grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6" aria-label="Key numbers">
          <Stat label="Stores" value={t.stores} sub={`${t.new_stores} new`} />
          <Stat label="Active stores" value={t.active_stores} sub="had activity or orders" />
          <Stat label="Products" value={t.products} sub="listed in total" />
          <Stat label="Orders" value={t.orders} sub="not counting cancelled" />
          <Stat label="Visitors" value={t.visitors} sub={`${t.views.toLocaleString()} page views`} />
          <Stat label="Conversion" value={conversion == null ? "–" : `${conversion.toFixed(1)}%`} sub="orders per visitor" />
        </section>

        <TrafficChart daily={s.daily} />

        <div className="grid gap-4 lg:grid-cols-2">
          <DailyBars daily={s.daily} field="orders" title="Orders" note="Orders placed per day, all stores" label="Orders" />
          <DailyBars daily={s.daily} field="new_stores" title="New stores" note="Stores created per day" label="New stores" />
        </div>

        <ActivityChart daily={s.daily} />

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <section className="surface overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <h2 className="text-[15px] font-semibold">Top stores</h2>
              <Link href={`/platform/stores?days=${days}`} className="text-[13px] font-medium text-[#0b6e4f] hover:underline">All stores</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-[13px]">
                <thead className="border-y border-[#eceee9] bg-[#f7f8f5] text-left text-xs text-[#5d6b63]">
                  <tr>
                    <th className="px-5 py-2 font-medium">Store</th>
                    <th className="px-3 py-2 text-right font-medium">Orders</th>
                    <th className="px-3 py-2 text-right font-medium">Sales</th>
                    <th className="px-5 py-2 text-right font-medium">Visitors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceee9]">
                  {s.stores.slice(0, 6).map((st) => (
                    <tr key={st.store_slug}>
                      <td className="px-5 py-2.5">
                        <Link href={`/store/${st.store_slug}`} target="_blank" className="font-semibold hover:underline">{st.store_name}</Link>
                        <p className="text-xs text-[#5d6b63]">Since {formatDate(st.created_at)}</p>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{st.orders}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatMoney(st.sales, st.currency)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums">{st.visitors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid content-start gap-4">
            <section className="surface p-5">
              <h2 className="text-[15px] font-semibold">Sales by currency</h2>
              <p className="mt-0.5 text-[13px] text-[#5d6b63]">Stores sell in different currencies, so totals aren’t added together.</p>
              {s.sales_by_currency.length === 0 ? (
                <p className="mt-4 text-sm text-[#5d6b63]">No orders in this period.</p>
              ) : (
                <ul className="mt-3 divide-y divide-[#eceee9] text-[13px]">
                  {s.sales_by_currency.map((c) => (
                    <li key={c.currency} className="flex items-center justify-between py-2">
                      <span className="font-medium">{c.currency}</span>
                      <span className="tabular-nums">
                        {formatMoney(c.sales, c.currency)} <span className="text-[#5d6b63]">· {c.orders} {c.orders === 1 ? "order" : "orders"}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="surface p-5">
              <h2 className="text-[15px] font-semibold">Themes in use</h2>
              <ul className="mt-3 grid gap-2.5 text-[13px]">
                {s.themes.map((th) => (
                  <li key={th.name}>
                    <div className="flex justify-between">
                      <span>{th.name}</span>
                      <span className="font-medium tabular-nums">{th.stores} {th.stores === 1 ? "store" : "stores"}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-[#eceee9]">
                      <div className="h-full rounded-full bg-[#2a78d6]" style={{ width: `${(th.stores / maxTheme) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Page>
  )
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub: string }) {
  return (
    <div className="border-[#eceee9] p-5 not-first:border-l max-md:[&:nth-child(3)]:border-l-0 max-md:[&:nth-child(n+3)]:border-t max-xl:md:[&:nth-child(4)]:border-l-0 max-xl:md:[&:nth-child(n+4)]:border-t">
      <p className="text-[13px] text-[#5d6b63]">{label}</p>
      <p className="mt-1 font-display text-[28px] leading-none font-bold tracking-[-0.03em] tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="mt-2 text-xs text-[#5d6b63]">{sub}</p>
    </div>
  )
}
