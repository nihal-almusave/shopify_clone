"use client"

import Link from "next/link"
import { formatMoney } from "@/lib/format"
import { useCart } from "@/components/store/cart"
import { useStore } from "@/components/store/store-context"
import { Quantity } from "@/components/store/quantity"

export default function CartPage() {
  const store = useStore()
  const { lines, ready, update, remove, subtotal } = useCart()
  const base = `/store/${store.store_slug}`

  if (!ready) return <div className="mx-auto max-w-4xl px-4 py-20" />

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 sm:py-16">
      <div className="mb-10 flex items-end justify-between">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Your cart</h1>
        <Link href={base} className="text-sm underline">Continue shopping</Link>
      </div>
      {lines.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 py-24 text-center">
          <p className="text-neutral-600">Your cart is empty</p>
          <Link href={base} className="mt-4 inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold text-white" style={{ background: "var(--store-accent)" }}>
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-4 py-6">
                <Link href={`${base}/products/${l.productId}`} className="size-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  {l.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.image} alt="" className="size-full object-cover" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Link href={`${base}/products/${l.productId}`} className="font-medium hover:underline">{l.name}</Link>
                    <p className="text-sm text-neutral-500">{formatMoney(l.price, store.currency)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Quantity size="sm" value={l.quantity} max={l.max} onChange={(q) => update(l.productId, q)} />
                    <button onClick={() => remove(l.productId)} className="text-xs text-neutral-500 underline">Remove</button>
                  </div>
                  <p className="w-24 font-medium sm:text-right">{formatMoney(l.price * l.quantity, store.currency)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 ml-auto max-w-sm">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal, store.currency)}</span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">Taxes and shipping calculated at checkout.</p>
            <Link href={`${base}/checkout`} className="mt-5 flex h-12 items-center justify-center rounded-full text-sm font-semibold text-white hover:opacity-90" style={{ background: "var(--store-accent)" }}>
              Check out
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
