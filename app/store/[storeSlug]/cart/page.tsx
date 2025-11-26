"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function CartPage({
  params,
}: {
  params: { storeSlug: string }
}) {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    const supabase = createClient()

    // Get all carts (for guests, we'll use the first one)
    const { data: carts } = await supabase.from("carts").select("id").limit(1)

    if (carts && carts.length > 0) {
      const { data: items } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          price,
          products:product_id (name, price, id)
        `)
        .eq("cart_id", carts[0].id)

      setCartItems(items || [])
    }

    setLoading(false)
  }

  const handleRemoveItem = async (itemId: string) => {
    const supabase = createClient()
    await supabase.from("cart_items").delete().eq("id", itemId)
    loadCart()
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    const supabase = createClient()
    if (newQuantity <= 0) {
      handleRemoveItem(itemId)
    } else {
      await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", itemId)
      loadCart()
    }
  }

  if (loading) return <div className="text-gray-500">Loading cart...</div>

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="md:col-span-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Link href={`/store/${params.storeSlug}`}>
                <Button>Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.products?.name}</h3>
                      <p className="text-gray-600 mt-1">${item.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-semibold text-gray-900 w-24 text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div>
        <Card className="sticky top-8">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between mb-8">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-gray-900 text-lg">${total.toFixed(2)}</span>
            </div>

            <Button
              className="w-full mb-3"
              disabled={cartItems.length === 0}
              onClick={() => router.push(`/store/${params.storeSlug}/checkout`)}
            >
              Proceed to Checkout
            </Button>

            <Link href={`/store/${params.storeSlug}`}>
              <Button variant="outline" className="w-full bg-transparent">
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
