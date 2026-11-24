"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useCart, type CartLine } from "@/components/store/cart"
import { useStore } from "@/components/store/store-context"
import { Quantity } from "@/components/store/quantity"

export function AddToCart({
  line,
  soldOut,
  lowStock,
}: {
  line: Omit<CartLine, "quantity">
  soldOut: boolean
  lowStock: number | null
}) {
  const [qty, setQty] = useState(1)
  const { add } = useCart()
  const store = useStore()
  const router = useRouter()

  return (
    <div className="mt-9 grid gap-4 border-y border-neutral-200 py-7">
      {lowStock != null && (
        <p className="flex items-center gap-2 text-sm text-amber-700">
          <span className="size-2 rounded-full bg-amber-500" /> Only {lowStock} left in stock
        </p>
      )}
      <div className="flex gap-3">
        <Quantity value={qty} max={line.max} onChange={(v) => setQty(Math.max(1, v))} />
        <button
          disabled={soldOut}
          onClick={() => add(line, qty)}
          className="h-12 flex-1 rounded-full border border-neutral-900 text-sm font-semibold transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400 disabled:hover:bg-transparent"
        >
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
      </div>
      {!soldOut && (
        <button
          onClick={() => {
            add(line, qty)
            router.push(`/store/${store.store_slug}/checkout`)
          }}
          className="h-12 rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg"
          style={{ background: "var(--store-accent)" }}
        >
          Buy it now
        </button>
      )}
    </div>
  )
}
