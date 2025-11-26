"use client"

import { useEffect, useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createCheckoutSession } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutItem {
  name: string
  price: number
  quantity: number
}

export default function StripeCheckout({ items }: { items: CheckoutItem[] }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    const initCheckout = async () => {
      try {
        const { clientSecret } = await createCheckoutSession(items)
        setClientSecret(clientSecret)
      } catch (error) {
        console.error("Failed to initialize checkout:", error)
      }
    }

    if (items.length > 0) {
      initCheckout()
    }
  }, [items])

  return (
    <div id="checkout">
      {clientSecret ? (
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading checkout...</p>
        </div>
      )}
    </div>
  )
}
