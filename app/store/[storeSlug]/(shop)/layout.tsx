import type React from "react"
import Link from "next/link"
import { getStorefront, getStoreTheme } from "@/lib/storefront"
import { themeStyle } from "@/lib/themes"
import { PageViewTracker } from "@/components/store/page-view-tracker"
import { StoreHeader } from "@/components/store/store-header"
import { CartDrawer } from "@/components/store/cart-drawer"

export default async function ShopLayout({ children, params }: { children: React.ReactNode; params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params
  const store = await getStorefront(storeSlug)
  const tokens = await getStoreTheme(store?.theme_id ?? null)
  return (
    <div className="store-theme min-h-screen" style={themeStyle(tokens, store?.accent_color ?? "#008060")}>
      <PageViewTracker slug={storeSlug} />
      <StoreHeader />
      <main>{children}</main>
      <CartDrawer />
      <footer className="mt-24 border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Link href={`/store/${storeSlug}`} className="font-display text-xl font-bold tracking-tight">{store?.store_name}</Link>
            {store?.description && <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">{store.description}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs text-neutral-500">
            <Link href={`/store/${storeSlug}#catalog`} className="hover:text-neutral-900">Shop all</Link>
            <Link href={`/store/${storeSlug}/cart`} className="hover:text-neutral-900">Your cart</Link>
            <span>© {new Date().getFullYear()} {store?.store_name}</span>
            <span>Powered by <Link href="/" className="font-semibold text-neutral-700 hover:underline">ShopHub</Link></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
