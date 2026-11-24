import { notFound } from "next/navigation"
import Link from "next/link"
import { Search, SlidersHorizontal } from "lucide-react"
import { getStorefront, resolveStoreTheme } from "@/lib/storefront"
import { StoreHero } from "@/components/store/store-hero"
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
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>
}) {
  const { storeSlug } = await params
  const { category, sort = "newest", q: rawQuery = "" } = await searchParams
  const search = rawQuery.trim().slice(0, 80)
  const store = await getStorefront(storeSlug)
  if (!store) notFound()
  const { tokens } = await resolveStoreTheme({ theme_id: store.theme_id })
  const supabase = await createClient()
  const selectedSort = SORTS[sort as keyof typeof SORTS] ?? SORTS.newest

  let query = supabase
    .from("products")
    .select("*")
    .eq("merchant_id", store.id)
    .eq("status", "active")
    .order(selectedSort.column, { ascending: selectedSort.ascending })
  if (category) query = query.eq("category", category)
  if (search) query = query.ilike("name", `%${search}%`)

  const [{ data }, { data: cats }] = await Promise.all([
    query,
    supabase.from("products").select("category").eq("merchant_id", store.id).eq("status", "active").not("category", "is", null),
  ])
  const products = (data ?? []) as Product[]
  const categories = [...new Set((cats ?? []).map((c) => c.category as string).filter(Boolean))].sort()
  const base = `/store/${storeSlug}`
  const link = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams(
      Object.entries({
        category,
        sort: sort === "newest" ? undefined : sort,
        q: search || undefined,
        ...changes,
      }).filter(([, value]) => value) as [string, string][],
    )
    const queryString = params.toString()
    return `${base}${queryString ? `?${queryString}` : ""}#catalog`
  }

  return (
    <>
      <StoreHero store={store} layout={tokens?.hero ?? "image"} />

      {categories.length > 0 && (
        <section id="categories" className="mx-auto max-w-[1320px] px-4 pt-16 sm:px-6">
          <div className="mb-6"><p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">Explore the collection</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Shop by category</h2></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((c) => <Link key={c} href={link({ category: c })} className="flex min-h-28 items-end rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-base font-semibold transition hover:-translate-y-1 hover:bg-white hover:shadow-md">{c}</Link>)}
          </div>
        </section>
      )}

      <section id="catalog" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-12 pb-20 sm:px-6 sm:pt-16">
        <div className="mb-7 flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">The collection</p>
              <h2 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">{category ?? "All products"}</h2>
              <p className="mt-1 text-sm text-neutral-500">
                {products.length} {products.length === 1 ? "product" : "products"}{search ? ` matching “${search}”` : ""}
              </p>
            </div>
            <form action={base} method="get" role="search" className="flex w-full max-w-md items-center gap-2 rounded-full border border-neutral-300 bg-white p-1.5 pl-4 shadow-sm transition focus-within:border-neutral-500 focus-within:ring-2 focus-within:ring-neutral-900/5">
              {category && <input type="hidden" name="category" value={category} />}
              {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
              <Search className="size-4 shrink-0 text-neutral-400" aria-hidden="true" />
              <input type="search" name="q" defaultValue={search} maxLength={80} placeholder="Search products" aria-label="Search products" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-neutral-400" />
              <button type="submit" className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "var(--store-accent)" }}>Search</button>
            </form>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-neutral-200 py-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2" aria-label="Filter by category">
              {categories.length > 0 && (
                <>
                  <Chip href={link({ category: undefined })} active={!category}>All</Chip>
                  {categories.map((c) => <Chip key={c} href={link({ category: c })} active={category === c}>{c}</Chip>)}
                </>
              )}
            </div>
            <details className="group relative shrink-0">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-neutral-300 px-3.5 py-2 text-sm transition hover:border-neutral-500">
                <SlidersHorizontal className="size-3.5" /> Sort: {selectedSort.label}
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl">
                {Object.entries(SORTS).map(([key, option]) => (
                  <Link key={key} href={link({ sort: key === "newest" ? undefined : key })} className={cn("block rounded-lg px-3 py-2 text-sm hover:bg-neutral-100", key === sort && "font-semibold")} aria-current={key === sort ? "true" : undefined}>
                    {option.label}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-20 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-white text-neutral-400 shadow-sm"><Search className="size-6" /></span>
            <h3 className="mt-4 font-display text-xl font-semibold text-neutral-900">{search ? "No matching products" : category ? "Nothing in this category yet" : "This store is getting ready"}</h3>
            <p className="mt-1 text-sm text-neutral-500">{search ? "Try a different search term or clear your filters." : "Check back soon for new products."}</p>
            {(search || category) && <Link href={base + "#catalog"} className="mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--store-accent)" }}>View all products</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} storeSlug={storeSlug} currency={store.currency} />)}
          </div>
        )}
      </section>
    </>
  )
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "true" : undefined} className={cn("rounded-full border px-4 py-2 text-sm transition-colors", active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 hover:border-neutral-900")}>
      {children}
    </Link>
  )
}
