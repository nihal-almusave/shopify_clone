"use server"

import { revalidatePath } from "next/cache"
import { requireMerchant } from "@/lib/auth"

type Result = { ok: true } | { ok: false; error: string }

async function updateOrder(orderId: string, patch: Record<string, unknown>): Promise<Result> {
  const { supabase, merchant } = await requireMerchant()
  const { error } = await supabase.from("orders").update(patch).eq("id", orderId).eq("merchant_id", merchant.id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/orders")
  revalidatePath("/admin", "layout")
  return { ok: true }
}

export async function markPaid(orderId: string) {
  return updateOrder(orderId, { payment_status: "paid", paid_at: new Date().toISOString() })
}

export async function fulfillOrder(orderId: string, trackingNumber: string) {
  return updateOrder(orderId, {
    fulfillment_status: "fulfilled",
    fulfilled_at: new Date().toISOString(),
    tracking_number: trackingNumber.trim() || null,
  })
}

export async function archiveOrder(orderId: string, archived: boolean) {
  return updateOrder(orderId, { status: archived ? "archived" : "open" })
}

export async function saveNote(orderId: string, note: string) {
  return updateOrder(orderId, { note: note.trim() || null })
}

/** Cancels the order and puts tracked stock back. */
export async function cancelOrder(orderId: string, restock: boolean): Promise<Result> {
  const { supabase, merchant } = await requireMerchant()
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, order_items(product_id, quantity)")
    .eq("id", orderId)
    .eq("merchant_id", merchant.id)
    .single()
  if (!order) return { ok: false, error: "Order not found" }
  if (order.status === "cancelled") return { ok: false, error: "Order is already cancelled" }

  if (restock) {
    for (const item of order.order_items ?? []) {
      if (!item.product_id) continue
      const { data: p } = await supabase
        .from("products")
        .select("quantity, track_inventory")
        .eq("id", item.product_id)
        .maybeSingle()
      if (p?.track_inventory) {
        await supabase.from("products").update({ quantity: p.quantity + item.quantity }).eq("id", item.product_id)
      }
    }
  }
  return updateOrder(orderId, { status: "cancelled", cancelled_at: new Date().toISOString() })
}
