"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        order_items:order_items (
          id,
          quantity,
          price,
          products:product_id (name)
        ),
        customers:customer_id (email, first_name, last_name)
      `)
      .eq("merchant_id", user.id)
      .order("created_at", { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  const handleOrderClick = async (order: any) => {
    const supabase = createClient()
    const { data: items } = await supabase
      .from("order_items")
      .select(`
        id,
        quantity,
        price,
        products:product_id (name, sku)
      `)
      .eq("order_id", order.id)

    setOrderDetails({ ...order, items })
    setSelectedOrder(order.id)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient()
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

    loadOrders()
    setSelectedOrder(null)
  }

  const updateFulfillmentStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient()
    await supabase.from("orders").update({ fulfillment_status: newStatus }).eq("id", orderId)

    loadOrders()
    setSelectedOrder(null)
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
      case "unfulfilled":
        return "bg-orange-500"
      case "shipped":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Orders List */}
      <div className="md:col-span-2">
        <h1 className="text-3xl font-bold text-white mb-8">Orders</h1>

        {orders.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400">No orders yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="bg-slate-800 border-slate-700 cursor-pointer hover:bg-slate-700 transition"
                onClick={() => handleOrderClick(order)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{order.order_number}</h3>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        <Badge className={getFulfillmentColor(order.fulfillment_status)}>
                          {order.fulfillment_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">
                        Customer: {order.customers?.first_name} {order.customers?.last_name}
                      </p>
                      <p className="text-sm text-slate-400">{order.customers?.email}</p>
                      <div className="flex gap-6 mt-3 text-sm text-slate-300">
                        <span>Total: ${order.total_price.toFixed(2)}</span>
                        <span>Items: {order.order_items?.length || 0}</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Panel */}
      {selectedOrder && orderDetails && (
        <div>
          <Card className="bg-slate-800 border-slate-700 sticky top-8">
            <CardHeader>
              <CardTitle className="text-white">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Info */}
              <div>
                <h3 className="font-semibold text-white mb-3">Order Info</h3>
                <div className="space-y-2 text-sm text-slate-400">
                  <p>
                    <span className="text-slate-300">Order #:</span> {orderDetails.order_number}
                  </p>
                  <p>
                    <span className="text-slate-300">Date:</span>{" "}
                    {new Date(orderDetails.created_at).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-slate-300">Total:</span>{" "}
                    <span className="text-white font-semibold">${orderDetails.total_price.toFixed(2)}</span>
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-white mb-3">Items</h3>
                <div className="space-y-2">
                  {orderDetails.items?.map((item: any) => (
                    <div key={item.id} className="text-sm text-slate-400 bg-slate-700/50 p-2 rounded">
                      <p className="text-slate-300">{item.products?.name}</p>
                      <p>
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Management */}
              <div>
                <h3 className="font-semibold text-white mb-3">Payment Status</h3>
                <div className="space-y-2">
                  {["pending", "completed", "failed"].map((status) => (
                    <Button
                      key={status}
                      variant={orderDetails.status === status ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => updateOrderStatus(selectedOrder, status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Fulfillment Status */}
              <div>
                <h3 className="font-semibold text-white mb-3">Fulfillment Status</h3>
                <div className="space-y-2">
                  {["unfulfilled", "fulfilled", "shipped"].map((status) => (
                    <Button
                      key={status}
                      variant={orderDetails.fulfillment_status === status ? "default" : "outline"}
                      size="sm"
                      className="w-full capitalize"
                      onClick={() => updateFulfillmentStatus(selectedOrder, status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-white mb-3">Shipping Address</h3>
                <div className="text-sm text-slate-400">
                  {orderDetails.shipping_address && (
                    <>
                      <p>{orderDetails.shipping_address.street}</p>
                      <p>
                        {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state}{" "}
                        {orderDetails.shipping_address.postalCode}
                      </p>
                      <p>{orderDetails.shipping_address.country}</p>
                    </>
                  )}
                </div>
              </div>

              <Button variant="outline" className="w-full bg-transparent" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
