"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadOrders()
  }, [])

  const checkUserAndLoadOrders = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If logged in as merchant, redirect to dashboard
    if (user) {
      router.push("/merchant/dashboard")
      return
    }

    // For guest checkout, get email from localStorage
    const checkoutCustomer = localStorage.getItem("checkout_customer")
    if (!checkoutCustomer) {
      router.push("/")
      return
    }

    const customer = JSON.parse(checkoutCustomer)
    setUserEmail(customer.email)

    // Load orders for this email
    const supabaseClient = createClient()
    const { data: customerData } = await supabaseClient
      .from("customers")
      .select("id")
      .eq("email", customer.email)
      .single()

    if (customerData) {
      const { data: ordersData } = await supabaseClient
        .from("orders")
        .select(`
          *,
          merchants:merchant_id (store_name),
          order_items:order_items (
            id,
            quantity,
            price,
            products:product_id (name)
          )
        `)
        .eq("customer_id", customerData.id)
        .order("created_at", { ascending: false })

      setOrders(ordersData || [])
    }

    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getFulfillmentColor = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "bg-blue-500"
      case "shipped":
        return "bg-purple-500"
      case "unfulfilled":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
            <p className="text-gray-600 mt-2">{userEmail}</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back Home</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
              <Link href="/">
                <Button>Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">{order.order_number}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium text-gray-900">Store:</span> {order.merchants?.store_name}
                        </p>
                        <p>
                          <span className="font-medium text-gray-900">Date:</span>{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium text-gray-900">Total:</span>{" "}
                          <span className="text-gray-900 font-semibold">${order.total_price.toFixed(2)}</span>
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          <Badge className={getFulfillmentColor(order.fulfillment_status)}>
                            {order.fulfillment_status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
                      <div className="space-y-1">
                        {order.order_items?.map((item: any) => (
                          <p key={item.id} className="text-sm text-gray-600">
                            {item.quantity}x {item.products?.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
