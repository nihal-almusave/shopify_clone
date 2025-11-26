"use server"

import { stripe } from "@/lib/stripe"

export async function createCheckoutSession(items: Array<{ name: string; price: number; quantity: number }>) {
  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      redirect_on_completion: "never",
    })

    return { clientSecret: session.client_secret }
  } catch (error) {
    console.error("Stripe error:", error)
    throw error
  }
}
