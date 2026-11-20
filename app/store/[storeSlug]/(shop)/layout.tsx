import type React from "react"
import Link from "next/link"
import { getStorefront } from "@/lib/storefront"
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
  return (
    <>
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
    </>
  )
}
