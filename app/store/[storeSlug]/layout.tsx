import type React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getStorefront } from "@/lib/storefront"
import { CartProvider } from "@/components/store/cart"
import { StoreProvider } from "@/components/store/store-context"

type Params = Promise<{ storeSlug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { storeSlug } = await params
  const store = await getStorefront(storeSlug)
  if (!store) return { title: "Store not found" }
  return {
    title: { default: store.store_name, template: `%s – ${store.store_name}` },
    description: store.description ?? `Shop ${store.store_name}`,
    openGraph: store.banner_url ? { images: [store.banner_url] } : undefined,
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
