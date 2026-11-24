import { requirePlatformAdmin } from "@/lib/platform"
import type { Theme } from "@/lib/themes"
import { Page } from "@/components/admin/ui"
import { ThemeSwatch } from "@/components/admin/theme-swatch"
import { AddThemeMenu } from "@/components/platform/add-theme-menu"
import { ThemeCardActions } from "@/components/platform/theme-card-actions"

export const metadata = { title: "Themes" }
export const dynamic = "force-dynamic"

/** Themes are previewed on the demo store so every admin sees the same sample content. */
const PREVIEW_STORE = "demo"

export default async function ThemesPage() {
  const { supabase, user } = await requirePlatformAdmin()
  const [{ data }, { data: usage }] = await Promise.all([
    supabase.from("themes").select("*").is("owner_id", null).order("created_at", { ascending: true }),
    supabase.rpc("platform_stats", { p_days: 7 }),
  ])
  const themes = (data ?? []) as Theme[]
  const inUse = new Map(((usage as { themes?: { name: string; stores: number }[] } | null)?.themes ?? []).map((t) => [t.name, t.stores]))
  const published = themes.filter((t) => t.is_published)
  const drafts = themes.filter((t) => !t.is_published)

  const grid = (list: Theme[]) => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {list.map((t) => (
        <article key={t.id} className="surface flex flex-col overflow-hidden">
          {t.preview_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.preview_url} alt="" className="aspect-[16/9] w-full object-cover" />
          ) : (
            <ThemeSwatch tokens={t.tokens} name={t.name} />
          )}
          <div className="flex flex-1 flex-col p-4">
            <h3 className="font-semibold">{t.name}</h3>
            {t.description && <p className="mt-1 line-clamp-2 text-[13px] text-[#5d6b63]">{t.description}</p>}
            <p className="mt-2 text-xs text-[#5d6b63]">
              {t.is_published ? `Live on ${inUse.get(t.name) ?? 0} ${(inUse.get(t.name) ?? 0) === 1 ? "store" : "stores"}` : "Only you can see this draft"}
            </p>
            <div className="mt-auto pt-4">
              <ThemeCardActions theme={t} previewStore={PREVIEW_STORE} />
            </div>
          </div>
        </article>
      ))}
    </div>
  )

  return (
    <Page title="Themes" subtitle="Upload, preview and publish themes. Published themes appear in every merchant’s Online Store → Themes." actions={<AddThemeMenu adminId={user.id} />}>
      <div className="grid gap-8">
        <section>
          <h2 className="mb-3 text-[15px] font-semibold">Theme store <span className="font-normal text-[#5d6b63]">· {published.length} published</span></h2>
          {published.length ? grid(published) : <p className="text-sm text-[#5d6b63]">No published themes. Merchants only see the ShopHub default.</p>}
        </section>
        <section>
          <h2 className="mb-3 text-[15px] font-semibold">Drafts <span className="font-normal text-[#5d6b63]">· {drafts.length}</span></h2>
          {drafts.length ? grid(drafts) : <p className="text-sm text-[#5d6b63]">Uploaded themes land here first, so you can preview them before publishing.</p>}
        </section>
      </div>
    </Page>
  )
}
