import Link from "next/link"
import type { Storefront } from "@/lib/types"
import type { HeroLayout } from "@/lib/themes"
import { cn } from "@/lib/utils"

/** Store homepage hero in the layout chosen by the store's theme. */
export function StoreHero({ store, layout }: { store: Storefront; layout: HeroLayout }) {
  const cta = (onPhoto: boolean) => (
    <Link
      href="#catalog"
      className={cn(
        "mt-8 inline-flex h-12 w-fit items-center rounded-full px-7 text-sm font-semibold transition-transform hover:-translate-y-0.5",
        onPhoto ? "bg-white text-neutral-900" : "text-white",
      )}
      style={onPhoto ? undefined : { background: "var(--store-accent)" }}
    >
      Explore collection
    </Link>
  )

  if (layout === "minimal" || (layout === "split" && !store.banner_url)) {
    return (
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <span className="mb-6 block h-1 w-16" style={{ background: "var(--store-accent)" }} aria-hidden />
          <h1 className="max-w-4xl font-display text-5xl leading-[1] font-bold tracking-tight sm:text-7xl">{store.store_name}</h1>
          {store.description && <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">{store.description}</p>}
          {cta(false)}
        </div>
      </section>
    )
  }

  if (layout === "split") {
    return (
      <section className="bg-neutral-50">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-16">
          <div>
            <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">{store.store_name}</h1>
            {store.description && <p className="mt-5 max-w-md text-lg leading-relaxed text-neutral-600">{store.description}</p>}
            {cta(false)}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={store.banner_url!} alt="" className="aspect-[4/3] w-full rounded-3xl object-cover" />
        </div>
      </section>
    )
  }

  return (
    <section className="relative isolate overflow-hidden">
      {store.banner_url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={store.banner_url} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/65 via-black/25 to-black/10" />
        </>
      ) : (
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(80rem 30rem at 0% 0%, color-mix(in srgb, var(--store-accent) 35%, var(--store-bg)) 0%, transparent 60%), radial-gradient(60rem 30rem at 100% 100%, color-mix(in srgb, var(--store-accent) 20%, var(--store-bg)) 0%, var(--store-surface) 70%)",
          }}
        />
      )}
      <div className={cn("mx-auto flex min-h-[340px] max-w-6xl flex-col justify-end px-4 py-14 sm:min-h-[440px] sm:px-6", store.banner_url && "text-white")}>
        <h1 className="max-w-2xl font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">{store.store_name}</h1>
        {store.description && <p className={cn("mt-4 max-w-xl text-lg leading-relaxed", store.banner_url ? "text-white/85" : "text-neutral-600")}>{store.description}</p>}
        {cta(!!store.banner_url)}
      </div>
    </section>
  )
}
