import Link from "next/link"
import { Plus } from "lucide-react"
import { requirePlatformAdmin } from "@/lib/platform"
import type { Theme } from "@/lib/themes"
import { Badge, Page } from "@/components/admin/ui"
import { ThemeSwatch } from "@/components/admin/theme-swatch"
import { ThemeUpload } from "@/components/platform/theme-upload"

export const metadata = { title: "Themes" }
export const dynamic = "force-dynamic"

export default async function ThemesPage() {
  const { supabase } = await requirePlatformAdmin()
  const [{ data: themes }, { data: usage }] = await Promise.all([
    supabase.from("themes").select("*").order("created_at", { ascending: true }),
    supabase.rpc("platform_stats", { p_days: 7 }),
  ])
  const inUse = new Map(((usage as { themes?: { name: string; stores: number }[] } | null)?.themes ?? []).map((t) => [t.name, t.stores]))

  return (
    <Page
      title="Themes"
      subtitle="Published themes appear in every merchant’s Settings → Theme."
      actions={
        <>
          <ThemeUpload />
          <Link href="/platform/themes/new" className="btn-primary">
            <Plus className="size-4" /> New theme
          </Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {((themes ?? []) as Theme[]).map((t) => (
          <Link key={t.id} href={`/platform/themes/${t.id}`} className="surface group overflow-hidden transition-shadow hover:ring-1 hover:ring-[#b9c2bc]">
            {t.preview_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.preview_url} alt="" className="aspect-[16/9] w-full object-cover" />
            ) : (
              <ThemeSwatch tokens={t.tokens} name={t.name} />
            )}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold group-hover:underline">{t.name}</h2>
                {t.is_published ? <Badge tone="success">Published</Badge> : <Badge tone="draft">Draft</Badge>}
              </div>
              {t.description && <p className="mt-1 line-clamp-2 text-[13px] text-[#5d6b63]">{t.description}</p>}
              <p className="mt-2 text-xs text-[#5d6b63]">
                Used by {inUse.get(t.name) ?? 0} {(inUse.get(t.name) ?? 0) === 1 ? "store" : "stores"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  )
}
