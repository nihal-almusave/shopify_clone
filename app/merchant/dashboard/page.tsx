"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const [products, orders, revenue] = await Promise.all([
        supabase.from("products").select("id", { count: "exact" }).eq("merchant_id", user.id),
        supabase.from("orders").select("id", { count: "exact" }).eq("merchant_id", user.id),
        supabase.from("orders").select("total_price").eq("merchant_id", user.id),
      ])

      const totalRevenue = (revenue.data || []).reduce((sum, order) => sum + (order.total_price || 0), 0)

      setStats({
        totalProducts: products.count || 0,
        totalOrders: orders.count || 0,
        totalRevenue: totalRevenue.toFixed(2),
      })
      setLoading(false)
    }

    loadStats()
  }, [])

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-300">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats?.totalProducts}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-300">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats?.totalOrders}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-300">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">${stats?.totalRevenue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
          <CardDescription className="text-slate-400">Your latest orders appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">
            View your recent orders on the{" "}
            <a href="/merchant/dashboard/orders" className="text-blue-400 underline">
              Orders page
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
