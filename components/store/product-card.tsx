import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { formatMoney } from "@/lib/format"
import type { Product } from "@/lib/types"

export function ProductCard({ product, storeSlug, currency }: { product: Product; storeSlug: string; currency: string }) {
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price
  const soldOut = product.track_inventory && product.quantity <= 0
  return (
    <Link href={`/store/${storeSlug}/products/${product.id}`} className="group block min-w-0" aria-label={`View ${product.name}, ${formatMoney(product.price, currency)}`}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--store-radius)] bg-neutral-100">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} loading="lazy" className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055]" />
        ) : (
          <div className="grid size-full place-items-center text-5xl font-display font-bold text-neutral-300">{product.name.slice(0, 1)}</div>
        )}
        {product.images[1] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[1]} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {soldOut ? <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-white">Sold out</span> : onSale && <span className="rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wide text-white" style={{ background: "var(--store-accent)", color: "var(--store-on-accent)" }}>Special price</span>}
        </div>
        <span className="absolute right-3 bottom-3 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-neutral-900 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="size-4" /></span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          {product.vendor && <p className="mb-1 truncate text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">{product.vendor}</p>}
          <h3 className="line-clamp-2 text-sm leading-snug font-medium transition-colors group-hover:text-neutral-500 sm:text-[15px]">{product.name}</h3>
          <p className="mt-2 flex flex-wrap items-baseline gap-2 text-sm">
            <span className={onSale ? "font-semibold" : "font-medium"} style={onSale ? { color: "var(--store-accent)" } : undefined}>{formatMoney(product.price, currency)}</span>
            {onSale && <span className="text-xs text-neutral-400 line-through">{formatMoney(product.compare_at_price, currency)}</span>}
          </p>
        </div>
      </div>
    </Link>
  )
}
