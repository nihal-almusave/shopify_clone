"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Eye, Loader2 } from "lucide-react"
import { publishTheme } from "@/app/admin/themes/actions"

/** Shown only to the person previewing a theme (Shopify-style). */
export function ThemePreviewBar({ storeSlug, themeId, themeName, canPublish }: { storeSlug: string; themeId: string | null; themeName: string; canPublish: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center gap-x-4 gap-y-2 bg-[#0b3d2c] px-4 py-2.5 text-sm text-white" role="status">
      <span className="flex items-center gap-2">
        <Eye className="size-4 shrink-0 text-[#36fba1]" />
        <span>
          You’re previewing <strong>{themeName}</strong>. Only you can see this.
        </span>
      </span>
      <span className="ml-auto flex items-center gap-2">
        {canPublish && (
          <button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await publishTheme(themeId)
                if (r.ok) router.refresh()
                else alert(r.error)
              })
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#36fba1] px-4 font-semibold text-[#0b3d2c] hover:bg-[#6dfdbc] disabled:opacity-60"
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />} Publish this theme
          </button>
        )}
        <a href={`/api/theme-preview?store=${storeSlug}&exit=1`} className="inline-flex h-8 items-center rounded-full px-4 font-semibold ring-1 ring-white/40 hover:bg-white/10">
          Exit preview
        </a>
      </span>
    </div>
  )
}
