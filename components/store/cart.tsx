"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type CartLine = {
  productId: string
  name: string
  price: number
  image: string | null
  quantity: number
  /** Available stock when added; null when inventory isn't tracked. */
  max: number | null
}

type CartContextValue = {
  lines: CartLine[]
  count: number
  subtotal: number
  ready: boolean
  open: boolean
  setOpen: (open: boolean) => void
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void
  update: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const clamp = (q: number, max: number | null) => Math.max(1, Math.min(q, max ?? 999, 999))

export function CartProvider({ storeSlug, children }: { storeSlug: string; children: ReactNode }) {
  const key = `shophub-cart:${storeSlug}`
  const [lines, setLines] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) setLines(JSON.parse(raw))
    } catch {
      // storage unavailable: start with an empty cart
    }
    setReady(true)
  }, [key])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(key, JSON.stringify(lines))
    } catch {
      // ignore
    }
  }, [key, lines, ready])

  const add = useCallback((line: Omit<CartLine, "quantity">, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === line.productId)
      if (existing)
        return prev.map((l) =>
          l.productId === line.productId ? { ...l, ...line, quantity: clamp(l.quantity + quantity, line.max) } : l,
        )
      return [...prev, { ...line, quantity: clamp(quantity, line.max) }]
    })
    setOpen(true)
  }, [])

  const update = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity: clamp(quantity, l.max) } : l)),
    )
  }, [])

  const remove = useCallback((productId: string) => setLines((prev) => prev.filter((l) => l.productId !== productId)), [])
  const clear = useCallback(() => setLines([]), [])

  const value = useMemo(
    () => ({
      lines,
      ready,
      open,
      setOpen,
      add,
      update,
      remove,
      clear,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: lines.reduce((s, l) => s + l.price * l.quantity, 0),
    }),
    [lines, ready, open, add, update, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
