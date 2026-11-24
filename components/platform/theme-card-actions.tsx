"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Download, Eye, Loader2, Paintbrush } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/format"
import { buildThemeZip, downloadBlob } from "@/lib/theme-package"
import type { Theme } from "@/lib/themes"

export function ThemeCardActions({ theme, previewStore }: { theme: Theme; previewStore: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const togglePublish = async () => {
    setBusy(true)
    const { error } = await createClient().from("themes").update({ is_published: !theme.is_published }).eq("id", theme.id)
    setBusy(false)
    if (error) return toast.error(error.message)
    toast.success(theme.is_published ? `${theme.name} removed from the theme store` : `${theme.name} is now in the theme store`)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a href={`/api/theme-preview?store=${previewStore}&theme=${theme.id}`} target="_blank" rel="noopener" className="btn-secondary">
        <Eye className="size-3.5" /> Preview
      </a>
      <Link href={`/platform/themes/${theme.id}`} className="btn-secondary">
        <Paintbrush className="size-3.5" /> Customize
      </Link>
      <button
        className="btn-secondary"
        aria-label={`Download ${theme.name}`}
        onClick={async () => downloadBlob(await buildThemeZip(theme), `${slugify(theme.name) || "theme"}.zip`)}
      >
        <Download className="size-3.5" />
      </button>
      <button className={theme.is_published ? "btn-secondary ml-auto" : "btn-primary ml-auto"} onClick={togglePublish} disabled={busy}>
        {busy && <Loader2 className="size-3.5 animate-spin" />}
        {theme.is_published ? "Unpublish" : "Publish"}
      </button>
    </div>
  )
}
