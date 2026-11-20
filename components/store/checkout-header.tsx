import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import type { Storefront } from "@/lib/types"

export function CheckoutHeader({ store }: { store: Storefront }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href={`/store/${store.store_slug}`} className="flex items-center gap-2.5">
          {store.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo_url} alt="" className="size-8 rounded-lg object-cover" />
          ) : null}
          <span className="font-display text-xl font-bold tracking-tight">{store.store_name}</span>
        </Link>
        <Link href={`/store/${store.store_slug}/cart`} aria-label="Cart" className="grid size-10 place-items-center rounded-full hover:bg-neutral-100" style={{ color: "var(--store-accent)" }}>
          <ShoppingBag className="size-5" />
        </Link>
      </div>
    </header>
  )
}
