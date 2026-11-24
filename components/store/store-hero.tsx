import Link from "next/link"
import type { Storefront } from "@/lib/types"
import type { HeroLayout } from "@/lib/themes"
import { ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

/** Store homepage hero in the layout chosen by the store's theme. */
export function StoreHero({ store, layout }: { store: Storefront; layout: HeroLayout }) {
  const cta = (onPhoto: boolean) => (
    <Link href="#catalog" className={cn("mt-8 inline-flex h-12 items-center gap-3 rounded-full px-7 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg", onPhoto ? "bg-white text-neutral-950" : "text-white")} style={onPhoto ? undefined : { background: "var(--store-accent)", color: "var(--store-on-accent)" }}>
      Explore collection <ArrowRight className="size-4" />
    </Link>
  )

  if (layout === "minimal" || (layout === "split" && !store.banner_url)) {
    return (
      <section className="relative overflow-hidden border-b border-neutral-200 bg-neutral-50">
        <div className="pointer-events-none absolute -top-32 right-[-5%] size-[420px] rounded-full opacity-20 blur-3xl" style={{ background: "var(--store-accent)" }} />
        <div className="relative mx-auto max-w-[1320px] px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-4 py-2 text-[11px] font-semibold tracking-[0.16em] text-neutral-600 uppercase"><Sparkles className="size-3.5" style={{ color: "var(--store-accent)" }} /> Curated for you</span>
          <h1 className="max-w-4xl font-display text-5xl leading-[0.98] font-bold tracking-[-0.055em] sm:text-7xl lg:text-[88px]">{store.store_name}</h1>
          {store.description && <p className="mt-7 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">{store.description}</p>}
          {cta(false)}
        </div>
      </section>
    )
  }

  if (layout === "split") {
    return (
      <section className="bg-neutral-50">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:py-16 lg:gap-16">
          <div className="py-5">
            <span className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">Discover something special</span>
            <h1 className="mt-5 font-display text-5xl leading-[1] font-bold tracking-[-0.05em] sm:text-6xl lg:text-7xl">{store.store_name}</h1>
            {store.description && <p className="mt-6 max-w-md text-base leading-7 text-neutral-600 sm:text-lg">{store.description}</p>}
            {cta(false)}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={store.banner_url!} alt="" className="aspect-[5/4] w-full rounded-[28px] object-cover shadow-xl" />
        </div>
      </section>
    )
  }

  return (
    <section className="relative isolate overflow-hidden">
      {store.banner_url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={store.banner_url} alt="" fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-black/35 to-black/10" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/35 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(80rem 30rem at 0% 0%, color-mix(in srgb, var(--store-accent) 35%, var(--store-bg)) 0%, transparent 60%), radial-gradient(60rem 30rem at 100% 100%, color-mix(in srgb, var(--store-accent) 20%, var(--store-bg)) 0%, var(--store-surface) 70%)" }} />
      )}
      <div className={cn("mx-auto flex min-h-[420px] max-w-[1320px] flex-col justify-end px-4 py-16 sm:min-h-[520px] sm:px-6 sm:py-20 lg:min-h-[590px]", store.banner_url && "text-white")}>
        <span className={cn("mb-5 text-[11px] font-semibold tracking-[0.2em] uppercase", store.banner_url ? "text-white/75" : "text-neutral-500")}>A collection worth discovering</span>
        <h1 className="max-w-3xl font-display text-5xl leading-[0.98] font-bold tracking-[-0.055em] sm:text-7xl lg:text-[88px]">{store.store_name}</h1>
        {store.description && <p className={cn("mt-5 max-w-xl text-base leading-7 sm:text-lg", store.banner_url ? "text-white/85" : "text-neutral-600")}>{store.description}</p>}
        {cta(!!store.banner_url)}
      </div>
    </section>
  )
}
