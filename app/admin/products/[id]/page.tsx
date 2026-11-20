import { notFound } from "next/navigation"
import { requireMerchant } from "@/lib/auth"
import type { Product } from "@/lib/types"
import { ProductForm } from "@/components/admin/product-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, merchant } = await requireMerchant()
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("merchant_id", merchant.id)
    .maybeSingle<Product>()
  if (!product) notFound()
  return (
    <ProductForm merchantId={merchant.id} currency={merchant.currency} storeSlug={merchant.store_slug} product={product} />
  )
}
