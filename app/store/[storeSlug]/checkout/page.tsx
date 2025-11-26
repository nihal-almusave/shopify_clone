"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import StripeCheckout from "@/components/stripe-checkout"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutPage({
  params,
}: {
  params: { storeSlug: string }
}) {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [store, setStore] = useState<any>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadCheckoutData()
  }, [])

  const loadCheckoutData = async () => {
    const supabase = createClient()

    // Get store info
    const { data: storeData } = await supabase.from("merchants").select("*").eq("store_slug", params.storeSlug).single()

    setStore(storeData)

    // Get cart items
    const { data: carts } = await supabase.from("carts").select("id").limit(1)

    if (carts && carts.length > 0) {
      const { data: items } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          price,
          products:product_id (name, id, merchant_id)
        `)
        .eq("cart_id", carts[0].id)

      setCartItems(items || [])
    }

    setLoading(false)
  }

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    const supabase = createClient()

    try {
      // Create or get customer
      let { data: customer } = await supabase.from("customers").select("id").eq("email", formData.email).maybeSingle()

      if (!customer) {
        const { data: newCustomer } = await supabase
          .from("customers")
          .insert({
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
          })
          .select()
          .single()

        customer = newCustomer
      }

      // Create address
      await supabase.from("customer_addresses").insert({
        customer_id: customer.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        street_address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        country: formData.country,
        is_default: true,
      })

      // Store customer info for payment processing
      localStorage.setItem(
        "checkout_customer",
        JSON.stringify({
          customerId: customer.id,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        }),
      )

      setShowPayment(true)
    } catch (error) {
      console.error("Shipping form error:", error)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const checkoutItems = cartItems.map((item) => ({
    name: item.products?.name || "Product",
    price: item.price,
    quantity: item.quantity,
  }))

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl">
      {/* Checkout Form or Payment */}
      <div className="md:col-span-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {!showPayment ? (
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Enter your shipping details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={processing} className="w-full mt-6">
                  {processing ? "Processing..." : "Continue to Payment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <StripeCheckout items={checkoutItems} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Summary */}
      <div>
        <Card className="sticky top-8">
          <CardContent className="pt-6">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 max-h-64 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{item.products?.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
