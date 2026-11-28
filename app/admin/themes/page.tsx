import Link from "next/link"
import { ExternalLink, Paintbrush } from "lucide-react"
import { requireMerchant } from "@/lib/auth"
import type { Theme, ThemeTokens } from "@/lib/themes"
import { AddThemeMenu } from "@/components/platform/add-theme-menu"
import { OwnThemeActions } from "@/components/admin/own-theme-actions"
import { Badge, Page } from "@/components/admin/ui"
import { ThemeSwatch } from "@/components/admin/theme-swatch"
import { PublishThemeButton } from "@/components/admin/publish-theme-button"

export const metadata = { title: "Themes" }
export const dynamic = "force-dynamic"

type Row = { id: string; name: string; description: string | null; preview_url: string | null; tokens: ThemeTokens | null }

export default async function ThemesPage() {
  const { supabase, merchant } = await requireMerchant()
  const [{ data }, { data: ownData }] = await Promise.all([
    supabase.from("themes").select("id, name, description, preview_url, tokens").eq("is_published", true).is("owner_id", null).order("created_at", { ascending: true }),
    supabase.from("themes").select("*").eq("owner_id", merchant.id).order("created_at", { ascending: false }),
  ])
  const own = (ownData ?? []) as Theme[]
  const all: Row[] = [{ id: "default", name: "ShopHub default", description: "The standard ShopHub look.", preview_url: null, tokens: null }, ...((data ?? []) as Row[]), ...own]
  const currentId = merchant.theme_id ?? "default"
  const current = all.find((t) => t.id === currentId) ?? all[0]
  const ownIds = new Set(own.map((t) => t.id))
  const library = all.filter((t) => t.id !== current.id && !ownIds.has(t.id))
  const previewHref = (id: string) => `/api/theme-preview?store=${merchant.store_slug}&theme=${id}`

  return (
    <Page title="Themes" subtitle="Online Store" actions={<AddThemeMenu adminId={merchant.id} ownerId={merchant.id} />}>
      <div className="grid gap-6">
        <section className="surface overflow-hidden">
          <div className="grid md:grid-cols-[minmax(0,1.3fr)_1fr]">
            <div className="border-b border-[#eceee9] bg-[#f7f8f5] p-5 md:border-r md:border-b-0">
              <div className="overflow-hidden rounded-xl ring-1 ring-[#e3e6df]">
                {current.preview_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.preview_url} alt="" className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <ThemeSwatch tokens={current.tokens} name={merchant.store_name} />
                )}
              </div>
            </div>
            <div className="flex flex-col p-6">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">{current.name}</h2>
                <Badge tone="success">Current theme</Badge>
              </div>
              {current.description && <p className="mt-2 text-sm text-[#5d6b63]">{current.description}</p>}
              <p className="mt-4 text-sm text-[#5d6b63]">
                Your logo, cover image, accent color and announcement come from{" "}
                <Link href="/admin/settings" className="font-medium text-[#0b6e4f] hover:underline">Settings → Brand</Link> and work with every theme.
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <Link href={`/store/${merchant.store_slug}`} target="_blank" className="btn-secondary">
                  View store <ExternalLink className="size-3.5" />
                </Link>
                <Link href="/admin/settings" className="btn-primary">
                  <Paintbrush className="size-3.5" /> Customize
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold">Your themes</h2>
          <p className="mt-0.5 mb-4 text-sm text-[#5d6b63]">
            Themes you uploaded or created. They’re private to your store. Use <strong>Add theme</strong> to upload a theme zip (theme.json + preview.png).
          </p>
          {own.length === 0 ? (
            <div className="surface flex flex-col items-center px-6 py-10 text-center">
              <p className="font-medium">No uploaded themes yet</p>
              <p className="mt-1 max-w-md text-sm text-[#5d6b63]">Got a theme file from a designer? Upload it with Add theme → Upload zip file, preview it on your store, then publish.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {own.map((t) => (
                <article key={t.id} className="surface flex flex-col overflow-hidden">
                  {t.preview_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.preview_url} alt="" className="aspect-[16/9] w-full object-cover" />
                  ) : (
                    <ThemeSwatch tokens={t.tokens} name={merchant.store_name} />
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{t.name}</h3>
                      {t.id === current.id && <Badge tone="success">Live</Badge>}
                    </div>
                    {t.description && <p className="mt-1 line-clamp-2 text-[13px] text-[#5d6b63]">{t.description}</p>}
                    <div className="mt-auto pt-4">
                      <OwnThemeActions theme={t} storeSlug={merchant.store_slug} isCurrent={t.id === current.id} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-[15px] font-semibold">Theme library</h2>
          <p className="mt-0.5 mb-4 text-sm text-[#5d6b63]">Preview a theme on your real store before you publish it. Only you see the preview.</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {library.map((t) => (
              <article key={t.id} className="surface flex flex-col overflow-hidden">
                {t.preview_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.preview_url} alt="" className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <ThemeSwatch tokens={t.tokens} name={merchant.store_name} />
                )}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold">{t.name}</h3>
                  {t.description && <p className="mt-1 line-clamp-2 text-[13px] text-[#5d6b63]">{t.description}</p>}
                  <div className="mt-auto flex gap-2 pt-4">
                    <a href={previewHref(t.id)} target="_blank" rel="noopener" className="btn-secondary flex-1">
                      Preview
                    </a>
                    <PublishThemeButton themeId={t.id === "default" ? null : t.id} name={t.name} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Page>
  )
}
