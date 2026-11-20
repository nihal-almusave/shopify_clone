import { requireMerchant } from "@/lib/auth"
import { ProductForm } from "@/components/admin/product-form"

export const metadata = { title: "Add product" }

export default async function NewProductPage() {
  const { merchant } = await requireMerchant()
  return <ProductForm merchantId={merchant.id} currency={merchant.currency} storeSlug={merchant.store_slug} />
}
