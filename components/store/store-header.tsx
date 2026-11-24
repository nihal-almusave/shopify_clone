"use client"

import Link from "next/link"
import { Search, ShoppingBag, ArrowUpRight } from "lucide-react"
import { useCart } from "@/components/store/cart"
import { useStore } from "@/components/store/store-context"

export function StoreHeader() {
  const store = useStore()
  const { count, setOpen } = useCart()
  const base = `/store/${store.store_slug}`
  return (
    <>
      {store.announcement && (
        <div className="px-4 py-2.5 text-center text-[11px] font-semibold tracking-[0.12em] text-white sm:text-xs" style={{ background: "var(--store-accent)", color: "var(--store-on-accent)" }}>
          {store.announcement}
        </div>
      )}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1320px] items-center gap-4 px-4 sm:px-6 lg:gap-8">
          <Link href={base} className="flex min-w-0 shrink-0 items-center gap-3" aria-label={store.store_name + " home"}>
            {store.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logo_url} alt="" className="size-10 rounded-xl object-cover" />
            ) : (
              <span className="grid size-10 place-items-center rounded-xl text-base font-bold text-white" style={{ background: "var(--store-accent)", color: "var(--store-on-accent)" }}>{store.store_name.slice(0, 1).toUpperCase()}</span>
            )}
            <span className="max-w-[180px] truncate font-display text-xl font-bold tracking-tight sm:max-w-none">{store.store_name}</span>
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] font-medium text-neutral-600 md:flex" aria-label="Main navigation">
            <Link href={base} className="transition hover:text-neutral-950">Home</Link>
            <Link href={base + "#catalog"} className="transition hover:text-neutral-950">Shop all</Link>
            <Link href={base + "#categories"} className="transition hover:text-neutral-950">Categories</Link>
          </nav>
          <form action={base} method="get" role="search" className="ml-auto hidden h-11 max-w-[360px] flex-1 items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 transition focus-within:border-neutral-400 focus-within:bg-white lg:flex">
            <Search className="size-4 shrink-0 text-neutral-400" aria-hidden="true" />
            <input type="search" name="q" maxLength={80} placeholder="Search the collection..." aria-label="Search products" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400" />
            <button type="submit" className="text-xs font-semibold text-neutral-600 hover:text-neutral-950">Search</button>
          </form>
          <button onClick={() => setOpen(true)} className="relative ml-auto grid size-11 shrink-0 place-items-center rounded-full border border-neutral-200 transition hover:bg-neutral-50 md:ml-0" aria-label={`Open cart, ${count} items`}>
            <ShoppingBag className="size-[18px]" />
            {count > 0 && <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: "var(--store-accent)", color: "var(--store-on-accent)" }}>{count > 99 ? "99+" : count}</span>}
          </button>
        </div>
        <form action={base} method="get" role="search" className="flex items-center gap-2 border-t border-neutral-100 px-4 py-2.5 md:hidden">
          <Search className="size-4 text-neutral-400" aria-hidden="true" />
          <input type="search" name="q" maxLength={80} placeholder="Search products..." aria-label="Search products" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400" />
          <button type="submit" className="text-xs font-semibold" style={{ color: "var(--store-accent)" }}>Search</button>
        </form>
      </header>
    </>
  )
}
