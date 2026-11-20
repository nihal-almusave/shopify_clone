import { notFound } from "next/navigation"
import Link from "next/link"
import { getStorefront } from "@/lib/storefront"
import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/store/product-card"
import { cn } from "@/lib/utils"

const SORTS = {
  newest: { label: "Newest", column: "created_at", ascending: false },
  "price-asc": { label: "Price, low to high", column: "price", ascending: true },
  "price-desc": { label: "Price, high to low", column: "price", ascending: false },
  name: { label: "Alphabetically", column: "name", ascending: true },
} as const

export default async function StoreHome({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>
  searchParams: Promise<{ category?: string; sort?: string }>
}) {
  const { storeSlug } = await params
  const { category, sort = "newest" } = await searchParams
  const store = await getStorefront(storeSlug)
  if (!store) notFound()
  const supabase = await createClient()
  const s = SORTS[sort as keyof typeof SORTS] ?? SORTS.newest

  let q = supabase
    .from("products")
    .select("*")
    .eq("merchant_id", store.id)
    .eq("status", "active")
    .order(s.column, { ascending: s.ascending })
  if (category) q = q.eq("category", category)
  const [{ data }, { data: cats }] = await Promise.all([
    q,
    supabase.from("products").select("category").eq("merchant_id", store.id).eq("status", "active").not("category", "is", null),
  ])
  const products = (data ?? []) as Product[]
  const categories = [...new Set((cats ?? []).map((c) => c.category as string).filter(Boolean))].sort()
  const base = `/store/${storeSlug}`
  const link = (p: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(Object.entries({ category, sort: sort === "newest" ? undefined : sort, ...p }).filter(([, v]) => v) as [string, string][])
    const qs = sp.toString()
    return `${base}${qs ? `?${qs}` : ""}#catalog`
  }

  return (
    <>
      <section className="relative isolate overflow-hidden">
        {store.banner_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={store.banner_url} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
          </>
        ) : (
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: "radial-gradient(80rem 30rem at 0% 0%, color-mix(in srgb, var(--store-accent) 35%, white) 0%, transparent 60%), radial-gradient(60rem 30rem at 100% 100%, color-mix(in srgb, var(--store-accent) 20%, white) 0%, #fafafa 70%)",
            }}
          />
        )}
        <div className={cn("mx-auto flex min-h-[340px] max-w-6xl flex-col justify-end px-4 py-14 sm:min-h-[440px] sm:px-6", store.banner_url && "text-white")}>
          <h1 className="max-w-2xl font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">{store.store_name}</h1>
          {store.description && <p className={cn("mt-4 max-w-xl text-lg", store.banner_url ? "text-white/85" : "text-neutral-600")}>{store.description}</p>}
          <Link
            href="#catalog"
            className={cn(
              "mt-8 inline-flex h-12 w-fit items-center rounded-full px-7 text-sm font-semibold transition-opacity hover:opacity-90",
              store.banner_url ? "bg-white text-neutral-900" : "text-white",
            )}
            style={store.banner_url ? undefined : { background: "var(--store-accent)" }}
          >
            Shop now
          </Link>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-14 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">{category ?? "All products"}</h2>
            <p className="mt-1 text-sm text-neutral-500">{products.length} products</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Chip href={link({ category: undefined })} active={!category}>All</Chip>
                {categories.map((c) => (
                  <Chip key={c} href={link({ category: c })} active={category === c}>
                    {c}
                  </Chip>
                ))}
              </div>
            )}
            <details className="relative">
              <summary className="cursor-pointer list-none rounded-full border border-neutral-300 px-4 py-2 text-sm">Sort: {s.label}</summary>
              <div className="absolute right-0 z-10 mt-2 w-52 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg">
                {Object.entries(SORTS).map(([k, v]) => (
                  <Link key={k} href={link({ sort: k === "newest" ? undefined : k })} className={cn("block rounded-lg px-3 py-2 text-sm hover:bg-neutral-100", k === sort && "font-semibold")}>
                    {v.label}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 py-20 text-center text-neutral-500">
            {category ? "No products in this category yet." : "This store is getting ready. Check back soon!"}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} storeSlug={storeSlug} currency={store.currency} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn("rounded-full border px-4 py-2 text-sm transition-colors", active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 hover:border-neutral-900")}
    >
      {children}
    </Link>
  )
}
