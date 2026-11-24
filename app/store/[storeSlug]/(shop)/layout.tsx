import type React from "react"
import Link from "next/link"
import { getStorefront, resolveStoreTheme } from "@/lib/storefront"
import { createClient } from "@/lib/supabase/server"
import { ThemePreviewBar } from "@/components/store/theme-preview-bar"
import { themeStyle } from "@/lib/themes"
import { PageViewTracker } from "@/components/store/page-view-tracker"
import { StoreHeader } from "@/components/store/store-header"
import { CartDrawer } from "@/components/store/cart-drawer"

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ storeSlug: string }>
}) {
  const { storeSlug } = await params
  const store = await getStorefront(storeSlug)
  const { tokens, preview } = await resolveStoreTheme({ theme_id: store?.theme_id ?? null })
  let isOwner = false
  if (preview && store) {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser()
    isOwner = user?.id === store.id
  }
  return (
    <div className="store-theme min-h-screen" style={themeStyle(tokens, store?.accent_color ?? "#008060")}>
      {preview && <ThemePreviewBar storeSlug={storeSlug} themeId={preview.id} themeName={preview.name} canPublish={isOwner} />}
      <PageViewTracker slug={storeSlug} />
      <StoreHeader />
      <main>{children}</main>
      <CartDrawer />
      <footer className="mt-24 border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} {store?.store_name}</p>
          <p>
            Powered by{" "}
            <Link href="/" className="font-medium text-neutral-700 hover:underline">
              ShopHub
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
