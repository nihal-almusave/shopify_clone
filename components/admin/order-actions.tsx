"use client"

import { useState, useTransition } from "react"
import { Loader2, MoreHorizontal, Truck } from "lucide-react"
import { toast } from "sonner"
import type { Order } from "@/lib/types"
import { archiveOrder, cancelOrder, fulfillOrder, markPaid, saveNote } from "@/app/admin/orders/actions"
import { Card } from "@/components/admin/ui"

type ActionResult = { ok: true } | { ok: false; error: string }

export function OrderActions({ order }: { order: Order }) {
  const [pending, start] = useTransition()
  const [fulfilling, setFulfilling] = useState(false)
  const [tracking, setTracking] = useState("")
  const [more, setMore] = useState(false)
  const cancelled = order.status === "cancelled"

  const run = (fn: () => Promise<ActionResult>, success: string) =>
    start(async () => {
      const res = await fn()
      if (res.ok) toast.success(success)
      else toast.error(res.error)
      setFulfilling(false)
      setMore(false)
    })

  return (
    <>
      {!cancelled && order.payment_status === "pending" && (
        <button className="btn-secondary" disabled={pending} onClick={() => run(() => markPaid(order.id), "Order marked as paid")}>
          Mark as paid
        </button>
      )}
      {!cancelled && order.fulfillment_status === "unfulfilled" && (
        <button className="btn-primary" disabled={pending} onClick={() => setFulfilling(true)}>
          <Truck className="size-3.5" /> Fulfill items
        </button>
      )}
      <div className="relative">
        <button className="btn-secondary" aria-label="More actions" onClick={() => setMore((m) => !m)}>
          More actions <MoreHorizontal className="size-3.5" />
        </button>
        {more && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMore(false)} />
            <div className="surface absolute right-0 z-40 mt-1 w-52 p-1.5 text-[13px]">
              <button
                className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-[#f2f3ef]"
                onClick={() => run(() => archiveOrder(order.id, order.status !== "archived"), order.status === "archived" ? "Order unarchived" : "Order archived")}
              >
                {order.status === "archived" ? "Unarchive" : "Archive"}
              </button>
              {!cancelled && (
                <button
                  className="w-full rounded-lg px-2 py-1.5 text-left text-[#8e0b21] hover:bg-[#fee9e8]"
                  onClick={() => {
                    if (confirm("Cancel this order and restock its items?")) run(() => cancelOrder(order.id, true), "Order cancelled")
                  }}
                >
                  Cancel order
                </button>
              )}
              <button className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-[#f2f3ef]" onClick={() => window.print()}>
                Print order
              </button>
            </div>
          </>
        )}
      </div>

      {fulfilling && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setFulfilling(false)}>
          <div className="surface w-full max-w-md p-0" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-[#eceee9] px-4 py-3 text-sm font-semibold">Fulfill #{order.order_number}</div>
            <div className="p-4">
              <label className="field-label" htmlFor="tracking">Tracking number (optional)</label>
              <input id="tracking" className="field" value={tracking} onChange={(e) => setTracking(e.target.value)} autoFocus />
              <p className="field-help">The customer can see this on their order status page.</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#eceee9] px-4 py-3">
              <button className="btn-secondary" onClick={() => setFulfilling(false)}>Cancel</button>
              <button className="btn-primary" disabled={pending} onClick={() => run(() => fulfillOrder(order.id, tracking), "Items fulfilled")}>
                {pending && <Loader2 className="size-3.5 animate-spin" />} Fulfill items
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function OrderNote({ orderId, note }: { orderId: string; note: string | null }) {
  const [value, setValue] = useState(note ?? "")
  const [editing, setEditing] = useState(false)
  const [pending, start] = useTransition()
  return (
    <Card
      title="Notes"
      action={
        !editing && (
          <button className="text-[13px] font-medium text-[#0b6e4f] hover:underline" onClick={() => setEditing(true)}>
            Edit
          </button>
        )
      }
    >
      {editing ? (
        <>
          <textarea className="field" rows={3} value={value} onChange={(e) => setValue(e.target.value)} />
          <div className="mt-2 flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => (setValue(note ?? ""), setEditing(false))}>Cancel</button>
            <button
              className="btn-primary"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await saveNote(orderId, value)
                  if (r.ok) setEditing(false)
                  else toast.error(r.error)
                })
              }
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <p className="text-[13px] text-[#5d6b63]">{note || "No notes from customer"}</p>
      )}
    </Card>
  )
}
