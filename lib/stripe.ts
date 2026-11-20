import "server-only"
import Stripe from "stripe"

let client: Stripe | null = null

/** Stripe is optional: without STRIPE_SECRET_KEY stores take manual payments (bank transfer / cash on delivery). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!client) client = new Stripe(key)
  return client
}
