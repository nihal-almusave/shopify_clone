import Link from "next/link"
import { formatMoney } from "@/lib/format"
import type { Product } from "@/lib/types"

export function ProductCard({ product, storeSlug, currency }: { product: Product; storeSlug: string; currency: string }) {
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price
  const soldOut = product.track_inventory && product.quantity <= 0
  return (
    <Link href={`/store/${storeSlug}/products/${product.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid size-full place-items-center text-4xl font-bold text-neutral-300">{product.name.slice(0, 1)}</div>
        )}
        {product.images[1] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[1]} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {soldOut ? (
            <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-white">Sold out</span>
          ) : (
            onSale && (
              <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white" style={{ background: "var(--store-accent)" }}>
                Sale
              </span>
            )
          )}
        </div>
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="text-[15px] leading-snug font-medium group-hover:underline">{product.name}</h3>
        <p className="mt-1 flex items-baseline gap-2 text-sm">
          <span className={onSale ? "font-semibold" : ""} style={onSale ? { color: "var(--store-accent)" } : undefined}>
            {formatMoney(product.price, currency)}
          </span>
          {onSale && <span className="text-neutral-400 line-through">{formatMoney(product.compare_at_price, currency)}</span>}
        </p>
      </div>
    </Link>
  )
}
