import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { RotateCcw, ShieldCheck, Truck } from "lucide-react"
import { getStorefront } from "@/lib/storefront"
import { createClient } from "@/lib/supabase/server"
import { formatMoney } from "@/lib/format"
import type { Product } from "@/lib/types"
import { ProductGallery } from "@/components/store/product-gallery"
import { AddToCart } from "@/components/store/add-to-cart"
import { ProductCard } from "@/components/store/product-card"

type Params = Promise<{ storeSlug: string; productId: string }>

async function load(storeSlug: string, productId: string) {
  const store = await getStorefront(storeSlug)
  if (!store || !/^[0-9a-f-]{36}$/i.test(productId)) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("merchant_id", store.id)
    .eq("status", "active")
    .maybeSingle<Product>()
  return data ? { store, product: data } : null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { storeSlug, productId } = await params
  const r = await load(storeSlug, productId)
  if (!r) return { title: "Product not found" }
  return {
    title: r.product.name,
    description: r.product.description?.slice(0, 160),
    openGraph: r.product.images[0] ? { images: [r.product.images[0]] } : undefined,
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { storeSlug, productId } = await params
  const r = await load(storeSlug, productId)
  if (!r) notFound()
  const { store, product } = r
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price
  const max = product.track_inventory ? Math.max(product.quantity, 0) : null

  const supabase = await createClient()
  let relatedQ = supabase.from("products").select("*").eq("merchant_id", store.id).eq("status", "active").neq("id", product.id).limit(4)
  if (product.category) relatedQ = relatedQ.eq("category", product.category)
  const { data: related } = await relatedQ

  return (
    <div className="mx-auto max-w-[1320px] px-4 pt-8 sm:px-6">
      <nav className="mb-8 text-xs font-medium text-neutral-500">
        <Link href={`/store/${storeSlug}`} className="hover:text-neutral-900">Home</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/store/${storeSlug}?category=${encodeURIComponent(product.category)}#catalog`} className="hover:text-neutral-900">
              {product.category}
            </Link>
          </>
        )}
      </nav>
      <div className="grid gap-8 md:grid-cols-[1.08fr_0.92fr] md:gap-12 lg:gap-20">
        <ProductGallery images={product.images} name={product.name} />
        <div className="md:sticky md:top-28 md:self-start md:py-5">
          {product.vendor && <p className="text-xs font-semibold tracking-[0.14em] text-neutral-500 uppercase">{product.vendor}</p>}
          <h1 className="mt-3 font-display text-3xl leading-[1.05] font-bold tracking-tight sm:text-5xl">{product.name}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold tracking-tight" style={onSale ? { color: "var(--store-accent)" } : undefined}>
              {formatMoney(product.price, store.currency)}
            </span>
            {onSale && (
              <>
                <span className="text-lg text-neutral-400 line-through">{formatMoney(product.compare_at_price, store.currency)}</span>
                <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ background: "var(--store-accent)" }}>
                  Save {Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)}%
                </span>
              </>
            )}
          </div>
          {store.tax_rate > 0 && <p className="mt-1 text-xs text-neutral-500">Tax calculated at checkout.</p>}

          <AddToCart
            line={{ productId: product.id, name: product.name, price: product.price, image: product.images[0] ?? null, max }}
            soldOut={max === 0}
            lowStock={max != null && max > 0 && max <= 5 ? max : null}
          />

          {product.description && (
            <div className="mt-9 border-t border-neutral-200 pt-7 text-[15px] leading-7 whitespace-pre-line text-neutral-700">
              {product.description}
            </div>
          )}

          <ul className="mt-9 grid gap-4 border-t border-neutral-200 pt-7 text-sm text-neutral-600">
            <li className="flex items-center gap-3">
              <Truck className="size-4" />
              {store.free_shipping_threshold != null
                ? `Free shipping on orders over ${formatMoney(store.free_shipping_threshold, store.currency)}`
                : store.shipping_rate > 0
                  ? `Flat-rate shipping ${formatMoney(store.shipping_rate, store.currency)}`
                  : "Free shipping"}
            </li>
            <li className="flex items-center gap-3"><ShieldCheck className="size-4" /> Secure checkout</li>
            <li className="flex items-center gap-3"><RotateCcw className="size-4" /> Easy returns. Contact the store</li>
          </ul>
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-6 font-display text-2xl font-bold tracking-tight">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {(related as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} storeSlug={storeSlug} currency={store.currency} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
