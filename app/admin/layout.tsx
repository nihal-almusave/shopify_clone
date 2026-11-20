import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata = { title: "Admin" }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: store }, { count: pendingOrders }] = await Promise.all([
    supabase.from("merchants").select("store_name, store_slug").eq("id", user.id).maybeSingle(),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("merchant_id", user.id)
      .eq("fulfillment_status", "unfulfilled")
      .neq("status", "cancelled"),
  ])

  if (!store) redirect("/auth/login?error=no-store")

  return (
    <AdminShell
      storeName={store.store_name}
      storeSlug={store.store_slug}
      email={user.email ?? ""}
      pendingOrders={pendingOrders ?? 0}
    >
      {children}
    </AdminShell>
  )
}
