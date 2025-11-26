"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function ProductPage({
  params,
}: {
  params: { storeSlug: string; productId: string }
}) {
  const [product, setProduct] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()

      // Load product
      const { data: productData } = await supabase.from("products").select("*").eq("id", params.productId).single()

      setProduct(productData)

      // Load reviews
      if (productData) {
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", params.productId)
          .order("created_at", { ascending: false })

        setReviews(reviewsData || [])
      }

      setLoading(false)
    }

    loadData()
  }, [params.productId])

  const handleAddToCart = async () => {
    const supabase = createClient()

    // Get or create cart
    let { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("session_id", `session-${Date.now()}`)
      .maybeSingle()

    if (!cart) {
      const { data: newCart } = await supabase
        .from("carts")
        .insert({
          session_id: `session-${Date.now()}`,
        })
        .select()
        .single()

      cart = newCart
    }

    // Add item to cart
    await supabase.from("cart_items").insert({
      cart_id: cart.id,
      product_id: params.productId,
      quantity,
      price: product.price,
    })

    router.push(`/store/${params.storeSlug}/cart`)
  }

  if (loading) return <div className="text-gray-500">Loading...</div>

  if (!product) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link href={`/store/${params.storeSlug}`}>
          <Button className="mt-4">Back to Store</Button>
        </Link>
      </div>
    )
  }

  const avgRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Product Image */}
      <div>
        {product.images && product.images[0] ? (
          <img src={product.images[0] || "/placeholder.svg"} alt={product.name} className="w-full rounded-lg" />
        ) : (
          <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

        {/* Rating */}
        {avgRating && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-lg font-semibold text-gray-900">{avgRating}</span>
            <span className="text-sm text-gray-600">({reviews.length} reviews)</span>
          </div>
        )}

        {/* Price */}
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">${product.price}</span>
          {product.compare_at_price && (
            <span className="text-lg text-gray-500 line-through ml-4">${product.compare_at_price}</span>
          )}
        </div>

        {/* Description */}
        {product.description && <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>}

        {/* Stock Status */}
        <div className="mb-8">
          {product.quantity > 0 ? (
            <span className="text-green-600 font-medium">In Stock</span>
          ) : (
            <span className="text-red-600 font-medium">Out of Stock</span>
          )}
        </div>

        {/* Add to Cart */}
        <div className="flex gap-4 mb-8">
          <input
            type="number"
            min="1"
            max={product.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <Button size="lg" onClick={handleAddToCart} disabled={product.quantity <= 0} className="flex-1">
            {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>

        {/* Share */}
        <Link href={`/store/${params.storeSlug}`}>
          <Button variant="outline" className="w-full bg-transparent">
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Reviews Section */}
      <div className="md:col-span-2 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex gap-1 mb-2">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            ★
                          </span>
                        ))}
                      </div>
                      {review.title && <h4 className="font-semibold text-gray-900">{review.title}</h4>}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-600">{review.comment}</p>}
                  {review.verified_purchase && <p className="text-xs text-green-600 mt-2">✓ Verified Purchase</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
