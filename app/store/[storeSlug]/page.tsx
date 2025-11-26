"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function StorePage({
  params,
}: {
  params: { storeSlug: string }
}) {
  const [products, setProducts] = useState<any[]>([])
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()

      // Load store
      const { data: storeData } = await supabase
        .from("merchants")
        .select("id")
        .eq("store_slug", params.storeSlug)
        .single()

      if (storeData) {
        setStore(storeData)

        // Load products
        const { data: productsData } = await supabase
          .from("products")
          .select("*")
          .eq("merchant_id", storeData.id)
          .eq("is_published", true)
          .order("created_at", { ascending: false })

        setProducts(productsData || [])
      }

      setLoading(false)
    }

    loadData()
  }, [params.storeSlug])

  if (loading) return <div className="text-gray-500">Loading products...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Products</h2>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products available yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/store/${params.storeSlug}/product/${product.id}`}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="pt-6">
                  {product.images && product.images[0] && (
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      {product.compare_at_price && (
                        <span className="text-sm text-gray-500 line-through">${product.compare_at_price}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{product.quantity > 0 ? "In Stock" : "Out of Stock"}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
