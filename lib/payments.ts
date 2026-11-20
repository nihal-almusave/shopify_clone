import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStripe } from "@/lib/stripe"

/** Confirms a Stripe Checkout session belongs to the order and marks it paid. Returns true when paid. */
export async function confirmStripeSession(orderId: string, sessionId: string) {
  const stripe = getStripe()
  const admin = createAdminClient()
  if (!stripe || !admin) return false
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.metadata?.order_id !== orderId || session.payment_status !== "paid") return false
    const { error } = await admin.rpc("mark_order_paid", { p_order_id: orderId, p_session_id: session.id })
    if (error) console.error("mark_order_paid failed", error)
    return !error
  } catch (e) {
    console.error("Stripe session lookup failed", e)
    return false
  }
}
