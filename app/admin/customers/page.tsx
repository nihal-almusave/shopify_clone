import Link from "next/link"
import { Search, Users } from "lucide-react"
import { requireMerchant } from "@/lib/auth"
import { formatDate, formatMoney } from "@/lib/format"
import type { Customer } from "@/lib/types"
import { Badge, Card, EmptyState, Page } from "@/components/admin/ui"

export const metadata = { title: "Customers" }

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams
  const { supabase, merchant } = await requireMerchant()
  let query = supabase
    .from("customers")
    .select("*")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: false })
    .limit(500)
  const term = q.trim().replace(/[%,()]/g, "")
  if (term) query = query.or(`email.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
  const { data } = await query
  const customers = (data ?? []) as Customer[]

  return (
    <Page title="Customers" subtitle={customers.length ? `${customers.length} customers` : undefined}>
      {customers.length === 0 && !term ? (
        <Card>
          <EmptyState icon={<Users className="size-7" />} heading="Everything customers-related in one place">
            Customers are added automatically when they place an order on your store.
          </EmptyState>
        </Card>
      ) : (
        <Card flush>
          <form className="border-b border-[#ebebeb] p-2" action="/admin/customers">
            <label className="flex items-center gap-2 rounded-lg border border-[#d4d4d4] px-2.5 py-1">
              <Search className="size-4 text-[#8a8a8a]" />
              <input name="q" defaultValue={q} placeholder="Search customers" className="w-full text-[13px] outline-none" />
            </label>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead className="bg-[#f7f7f7] text-left text-xs text-[#616161]">
                <tr>
                  <th className="px-4 py-2 font-medium">Customer name</th>
                  <th className="px-3 py-2 font-medium">Email subscription</th>
                  <th className="px-3 py-2 font-medium">Orders</th>
                  <th className="px-3 py-2 text-right font-medium">Amount spent</th>
                  <th className="px-4 py-2 font-medium">Customer since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f7f7f7]">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/orders?q=${encodeURIComponent(c.email)}`} className="font-semibold hover:underline">
                        {[c.first_name, c.last_name].filter(Boolean).join(" ") || c.email}
                      </Link>
                      <p className="text-xs text-[#616161]">{c.email}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      {c.accepts_marketing ? <Badge tone="success">Subscribed</Badge> : <Badge tone="neutral">Not subscribed</Badge>}
                    </td>
                    <td className="px-3 py-2.5">{c.orders_count} orders</td>
                    <td className="px-3 py-2.5 text-right">{formatMoney(c.total_spent, merchant.currency)}</td>
                    <td className="px-4 py-2.5 text-[#616161]">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </Page>
  )
}
