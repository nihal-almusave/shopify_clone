"use server"

import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe"
import { stripeEnabled } from "@/lib/storefront"
import { getSiteUrl } from "@/lib/site"
import type { PublicOrder, ShippingAddress } from "@/lib/types"

export type CheckoutInput = {
  storeSlug: string
  items: { product_id: string; quantity: number }[]
  customer: { email: string; first_name: string; last_name: string; phone: string; accepts_marketing: boolean }
  shipping: ShippingAddress
  note?: string
}

export type CheckoutResult = { ok: true; redirectUrl: string } | { ok: false; error: string }

const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "CLP", "XOF", "XAF", "UGX", "RWF", "PYG"])
const toMinor = (amount: number, currency: string) =>
  ZERO_DECIMAL.has(currency.toUpperCase()) ? Math.round(amount) : Math.round(amount * 100)

async function createStripeSession(order: PublicOrder) {
  const stripe = getStripe()!
  const site = getSiteUrl(await headers())
  const currency = order.currency.toLowerCase()
  const lineItems = order.items.map((i) => ({
    quantity: i.quantity,
    price_data: {
      currency,
      unit_amount: toMinor(Number(i.price), order.currency),
      product_data: { name: i.name, ...(i.image && /^https:\/\//.test(i.image) ? { images: [i.image] } : {}) },
    },
  }))
  if (Number(order.tax) > 0)
    lineItems.push({ quantity: 1, price_data: { currency, unit_amount: toMinor(Number(order.tax), order.currency), product_data: { name: "Taxes" } } })
  if (Number(order.shipping_cost) > 0)
    lineItems.push({ quantity: 1, price_data: { currency, unit_amount: toMinor(Number(order.shipping_cost), order.currency), product_data: { name: "Shipping" } } })

  const orderUrl = `${site}/store/${order.store_slug}/orders/${order.id}`
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.email,
    line_items: lineItems,
    client_reference_id: order.id,
    metadata: { order_id: order.id },
    payment_intent_data: { metadata: { order_id: order.id } },
    success_url: `${orderUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${orderUrl}?payment=cancelled`,
  })
  return session.url!
}

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const supabase = await createClient()
  const useStripe = stripeEnabled()
  const { data, error } = await supabase.rpc("place_order", {
    p_store_slug: input.storeSlug,
    p_items: input.items,
    p_customer: input.customer,
    p_shipping: input.shipping,
    p_payment_method: useStripe ? "stripe" : "manual",
    p_note: input.note ?? null,
  })
  if (error) return { ok: false, error: error.message }

  const orderId = (data as { order_id: string }).order_id
  const orderPath = `/store/${input.storeSlug}/orders/${orderId}`
  if (!useStripe) return { ok: true, redirectUrl: `${orderPath}?new=1` }

  try {
    const { data: order } = await supabase.rpc("get_order_public", { p_order_id: orderId })
    return { ok: true, redirectUrl: await createStripeSession(order as PublicOrder) }
  } catch (e) {
    console.error("Stripe session failed", e)
    // The order exists; the shopper can retry payment from the order page.
    return { ok: true, redirectUrl: `${orderPath}?payment=error` }
  }
}

/** Retry card payment for a pending Stripe order (from the order status page). */
export async function payForOrder(orderId: string): Promise<CheckoutResult> {
  if (!stripeEnabled()) return { ok: false, error: "Card payments aren’t enabled for this store" }
  const supabase = await createClient()
  const { data } = await supabase.rpc("get_order_public", { p_order_id: orderId })
  const order = data as PublicOrder | null
  if (!order) return { ok: false, error: "Order not found" }
  if (order.payment_status !== "pending" || order.status === "cancelled") return { ok: false, error: "This order can’t be paid" }
  try {
    return { ok: true, redirectUrl: await createStripeSession(order) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Couldn’t start payment" }
  }
}
