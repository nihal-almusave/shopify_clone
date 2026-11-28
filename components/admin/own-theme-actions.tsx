"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Download, Paintbrush, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/format"
import { buildThemeZip, downloadBlob } from "@/lib/theme-package"
import type { Theme } from "@/lib/themes"
import { PublishThemeButton } from "@/components/admin/publish-theme-button"

/** Actions for a theme the merchant uploaded themselves. */
export function OwnThemeActions({ theme, storeSlug, isCurrent }: { theme: Theme; storeSlug: string; isCurrent: boolean }) {
  const router = useRouter()
  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <a href={`/api/theme-preview?store=${storeSlug}&theme=${theme.id}`} target="_blank" rel="noopener" className="btn-secondary flex-1">
          Preview
        </a>
        {!isCurrent && <PublishThemeButton themeId={theme.id} name={theme.name} />}
      </div>
      <div className="flex gap-2">
        <Link href={`/admin/themes/${theme.id}`} className="btn-secondary flex-1">
          <Paintbrush className="size-3.5" /> Customize
        </Link>
        <button className="btn-secondary" aria-label={`Download ${theme.name}`} onClick={async () => downloadBlob(await buildThemeZip(theme), `${slugify(theme.name) || "theme"}.zip`)}>
          <Download className="size-3.5" />
        </button>
        <button
          className="btn-critical"
          aria-label={`Delete ${theme.name}`}
          onClick={async () => {
            if (!confirm(isCurrent ? `Delete “${theme.name}”? It’s live, so your store goes back to the ShopHub default.` : `Delete “${theme.name}”?`)) return
            const { error } = await createClient().from("themes").delete().eq("id", theme.id)
            if (error) return toast.error(error.message)
            toast.success("Theme deleted")
            router.refresh()
          }}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
