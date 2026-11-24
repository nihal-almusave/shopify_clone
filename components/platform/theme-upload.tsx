"use client"

import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { parseTokens } from "@/lib/themes"
import { slugify } from "@/lib/format"

/**
 * Imports a theme file. Accepted shape (the same as Export in the editor):
 * { "name": "...", "description": "...", "tokens": { background, surface, text, muted, border, accent?, headingFont, corners, hero } }
 * Imported themes start as drafts.
 */
export function ThemeUpload() {
  const router = useRouter()
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      if (file.size > 50_000) throw new Error("Theme files must be under 50 KB.")
      let json: Record<string, unknown>
      try {
        json = JSON.parse(await file.text())
      } catch {
        throw new Error("That file isn’t valid JSON.")
      }
      const name = String(json.name ?? "").trim().slice(0, 60)
      if (!name) throw new Error("The theme file needs a \"name\".")
      const parsed = parseTokens(json.tokens ?? json)
      if (!parsed.ok) throw new Error(parsed.error)
      const base = slugify(String(json.slug ?? name)) || "theme"
      const { data, error } = await createClient()
        .from("themes")
        .insert({
          name,
          slug: `${base}-${Math.random().toString(36).slice(2, 6)}`,
          description: json.description ? String(json.description).slice(0, 280) : null,
          tokens: parsed.tokens,
          is_published: false,
        })
        .select("id")
        .single()
      if (error) throw new Error(error.message)
      toast.success(`Imported “${name}” as a draft`)
      router.push(`/platform/themes/${data.id}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed")
    } finally {
      setBusy(false)
      if (ref.current) ref.current.value = ""
    }
  }

  return (
    <>
      <button className="btn-secondary" onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload theme file
      </button>
      <input ref={ref} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
    </>
  )
}
