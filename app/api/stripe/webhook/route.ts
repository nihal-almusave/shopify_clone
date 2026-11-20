import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Stripe webhook: marks orders paid even if the shopper closes the tab before returning.
 * Subscribe to checkout.session.completed and checkout.session.async_payment_succeeded.
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const admin = createAdminClient()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !admin || !secret) return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 })

  const signature = request.headers.get("stripe-signature")
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret)
  } catch (e) {
    return NextResponse.json({ error: `Invalid signature: ${(e as Error).message}` }, { status: 400 })
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.order_id
    if (orderId && session.payment_status === "paid") {
      const { error } = await admin.rpc("mark_order_paid", { p_order_id: orderId, p_session_id: session.id })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
