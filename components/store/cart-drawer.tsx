"use client"

import Link from "next/link"
import { useEffect } from "react"
import { ShoppingBag, X } from "lucide-react"
import { formatMoney } from "@/lib/format"
import { useCart } from "@/components/store/cart"
import { useStore } from "@/components/store/store-context"
import { Quantity } from "@/components/store/quantity"

export function CartDrawer() {
  const store = useStore()
  const { lines, open, setOpen, update, remove, subtotal } = useCart()
  const base = `/store/${store.store_slug}`
  const threshold = store.free_shipping_threshold

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, setOpen])

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
      <aside
        role="dialog"
        aria-label="Cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-[transform,visibility] duration-300 ${open ? "visible translate-x-0" : "invisible translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-semibold">Your cart</h2>
          <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-neutral-100" aria-label="Close cart">
            <X className="size-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag className="size-10 text-neutral-300" />
            <p className="text-neutral-600">Your cart is empty</p>
            <button onClick={() => setOpen(false)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--store-accent)" }}>
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            {threshold != null && (
              <div className="border-b border-neutral-200 px-5 py-3 text-[13px]">
                {subtotal >= threshold ? (
                  <p className="font-medium">You’ve unlocked free shipping 🎉</p>
                ) : (
                  <p>
                    Spend <strong>{formatMoney(threshold - subtotal, store.currency)}</strong> more for free shipping
                  </p>
                )}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%`, background: "var(--store-accent)" }} />
                </div>
              </div>
            )}
            <ul className="flex-1 divide-y divide-neutral-100 overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.productId} className="flex gap-4 py-4">
                  <Link href={`${base}/products/${l.productId}`} onClick={() => setOpen(false)} className="size-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {l.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.image} alt="" className="size-full object-cover" />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="truncate text-sm font-medium">{l.name}</p>
                      <p className="text-sm font-medium">{formatMoney(l.price * l.quantity, store.currency)}</p>
                    </div>
                    <p className="text-xs text-neutral-500">{formatMoney(l.price, store.currency)}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <Quantity size="sm" value={l.quantity} max={l.max} onChange={(q) => update(l.productId, q)} />
                      <button onClick={() => remove(l.productId)} className="text-xs text-neutral-500 underline hover:text-neutral-900">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-neutral-200 p-5">
              <div className="flex justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal, store.currency)}</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">Taxes and shipping calculated at checkout.</p>
              <Link
                href={`${base}/checkout`}
                onClick={() => setOpen(false)}
                className="mt-4 flex h-12 items-center justify-center rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--store-accent)" }}
              >
                Check out
              </Link>
              <Link href={`${base}/cart`} onClick={() => setOpen(false)} className="mt-2 block text-center text-sm text-neutral-600 underline">
                View cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
