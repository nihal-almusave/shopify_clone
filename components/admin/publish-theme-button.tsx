"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { publishTheme } from "@/app/admin/themes/actions"

export function PublishThemeButton({ themeId, name }: { themeId: string | null; name: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <button
      className="btn-primary flex-1"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Publish “${name}”? Customers will see it on your store right away.`)) return
        start(async () => {
          const r = await publishTheme(themeId)
          if (r.ok) {
            toast.success(`${name} is now live on your store`)
            router.refresh()
          } else toast.error(r.error)
        })
      }}
    >
      {pending && <Loader2 className="size-3.5 animate-spin" />} Publish
    </button>
  )
}
