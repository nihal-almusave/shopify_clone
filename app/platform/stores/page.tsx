import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { requirePlatformAdmin, type PlatformStats } from "@/lib/platform"
import { formatDate, formatMoney } from "@/lib/format"
import { Page } from "@/components/admin/ui"

export const metadata = { title: "Stores" }
export const dynamic = "force-dynamic"

export default async function PlatformStores({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: raw } = await searchParams
  const days = [7, 30, 90].includes(Number(raw)) ? Number(raw) : 30
  const { supabase } = await requirePlatformAdmin()
  const { data } = await supabase.rpc("platform_stats", { p_days: days })
  const stores = ((data as PlatformStats | null)?.stores ?? []).slice().sort((a, b) => +new Date(b.last_active) - +new Date(a.last_active))

  return (
    <Page title="Stores" subtitle={`${stores.length} stores · numbers for the last ${days} days`}>
      <section className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-[13px]">
            <thead className="border-b border-[#eceee9] bg-[#f7f8f5] text-left text-xs text-[#5d6b63]">
              <tr>
                <th className="px-5 py-2.5 font-medium">Store</th>
                <th className="px-3 py-2.5 font-medium">Theme</th>
                <th className="px-3 py-2.5 text-right font-medium">Products</th>
                <th className="px-3 py-2.5 text-right font-medium">Orders</th>
                <th className="px-3 py-2.5 text-right font-medium">Sales</th>
                <th className="px-3 py-2.5 text-right font-medium">Visitors</th>
                <th className="px-3 py-2.5 text-right font-medium">Page views</th>
                <th className="px-5 py-2.5 font-medium">Last active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceee9]">
              {stores.map((s) => (
                <tr key={s.store_slug} className="hover:bg-[#f7f8f5]">
                  <td className="px-5 py-3">
                    <Link href={`/store/${s.store_slug}`} target="_blank" className="inline-flex items-center gap-1 font-semibold hover:underline">
                      {s.store_name} <ExternalLink className="size-3 text-[#8a958e]" />
                    </Link>
                    <p className="text-xs text-[#5d6b63]">/store/{s.store_slug} · since {formatDate(s.created_at)}</p>
                  </td>
                  <td className="px-3 py-3 text-[#5d6b63]">{s.theme_name ?? "Default"}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.products}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.orders}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatMoney(s.sales, s.currency)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.visitors}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.views}</td>
                  <td className="px-5 py-3 text-[#5d6b63]">{formatDate(s.last_active)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Page>
  )
}
