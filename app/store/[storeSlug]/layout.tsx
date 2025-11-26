"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { storeSlug: string }
}) {
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStore = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("merchants").select("*").eq("store_slug", params.storeSlug).single()

      setStore(data)
      setLoading(false)
    }

    loadStore()
  }, [params.storeSlug])

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>

  if (!store) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Store not found</h1>
          <Link href="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Store Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {store.banner_url && (
            <img
              src={store.banner_url || "/placeholder.svg"}
              alt="Store banner"
              className="w-full h-32 object-cover rounded-lg mb-6"
            />
          )}
          <div className="flex items-center gap-6">
            {store.logo_url && (
              <img
                src={store.logo_url || "/placeholder.svg"}
                alt="Store logo"
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{store.store_name}</h1>
              {store.description && <p className="text-gray-600 mt-2">{store.description}</p>}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <Link href={`/store/${params.storeSlug}`}>
              <Button variant="ghost">All Products</Button>
            </Link>
            <Link href={`/store/${params.storeSlug}/cart`}>
              <Button variant="ghost">Cart</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
