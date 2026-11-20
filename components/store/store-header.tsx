"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/components/store/cart"
import { useStore } from "@/components/store/store-context"

export function StoreHeader() {
  const store = useStore()
  const { count, setOpen } = useCart()
  const base = `/store/${store.store_slug}`
  return (
    <>
      {store.announcement && (
        <div className="px-4 py-2 text-center text-[13px] font-medium text-white" style={{ background: "var(--store-accent)" }}>
          {store.announcement}
        </div>
      )}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href={base} className="flex min-w-0 items-center gap-2.5">
            {store.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logo_url} alt="" className="size-9 rounded-lg object-cover" />
            ) : (
              <span className="grid size-9 place-items-center rounded-lg text-sm font-bold text-white" style={{ background: "var(--store-accent)" }}>
                {store.store_name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="truncate font-display text-lg font-bold tracking-tight">{store.store_name}</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-6 text-sm text-neutral-600 sm:flex">
            <Link href={base} className="hover:text-neutral-900">Home</Link>
            <Link href={`${base}#catalog`} className="hover:text-neutral-900">Catalog</Link>
          </nav>
          <button
            onClick={() => setOpen(true)}
            className="relative ml-auto grid size-10 place-items-center rounded-full hover:bg-neutral-100 sm:ml-0"
            aria-label={`Open cart, ${count} items`}
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute top-0.5 right-0.5 grid min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-bold text-white" style={{ background: "var(--store-accent)" }}>
                {count}
              </span>
            )}
          </button>
        </div>
      </header>
    </>
  )
}
