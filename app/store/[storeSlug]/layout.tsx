import type React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getStorefront } from "@/lib/storefront"
import type { Storefront } from "@/lib/types"
import { CartProvider } from "@/components/store/cart"
import { StoreProvider } from "@/components/store/store-context"

type Params = Promise<{ storeSlug: string }>

/** Uploaded favicon → store logo → generated letter icon in the store's accent color. */
function storeIcons(store: Storefront): Metadata["icons"] {
  const uploaded = store.favicon_url || store.logo_url
  if (uploaded) return { icon: uploaded, apple: uploaded }
  // Version the URL so browsers pick up a new name or color right away.
  const v = encodeURIComponent(`${store.store_name.trim()[0] ?? ""}${store.accent_color}`)
  const base = `/api/icon?store=${encodeURIComponent(store.store_slug)}&v=${v}`
  return {
    icon: { url: `${base}&size=64`, type: "image/png", sizes: "64x64" },
    apple: { url: `${base}&size=180`, sizes: "180x180" },
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { storeSlug } = await params
  const store = await getStorefront(storeSlug)
  if (!store) return { title: "Store not found" }
  return {
    title: { absolute: store.store_name, template: `%s – ${store.store_name}` },
    description: store.description ?? `Shop ${store.store_name}`,
    alternates: { canonical: `/store/${store.store_slug}` },
    openGraph: { type: "website", siteName: store.store_name, title: store.store_name, description: store.description ?? `Shop ${store.store_name} online`, url: `/store/${store.store_slug}`, ...(store.banner_url ? { images: [store.banner_url] } : {}) },
    icons: storeIcons(store),
  }
}

export default async function StoreRootLayout({ children, params }: { children: React.ReactNode; params: Params }) {
  const { storeSlug } = await params
  const store = await getStorefront(storeSlug)
  if (!store) notFound()

  return (
    <StoreProvider store={store}>
      <CartProvider storeSlug={store.store_slug}>
        <div className="min-h-screen bg-white text-neutral-900" style={{ ["--store-accent" as string]: store.accent_color }}>
          {children}
        </div>
      </CartProvider>
    </StoreProvider>
  )
}
