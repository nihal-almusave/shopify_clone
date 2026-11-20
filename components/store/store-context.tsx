"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Storefront } from "@/lib/types"

const StoreContext = createContext<Storefront | null>(null)

export function StoreProvider({ store, children }: { store: Storefront; children: ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used inside StoreProvider")
  return ctx
}
