"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { ChevronDown, FileJson, FileArchive, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/format"
import { readThemePackage } from "@/lib/theme-package"
import { uploadStoreImage } from "@/components/admin/upload"

/** "Add theme" menu like Shopify's: upload a theme package or start a blank theme. Uploads arrive unpublished. */
export function AddThemeMenu({ adminId, ownerId }: { adminId: string; ownerId?: string }) {
  const base = ownerId ? "/admin/themes" : "/platform/themes"
  const router = useRouter()
  const zipRef = useRef<HTMLInputElement>(null)
  const jsonRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const onFile = async (file: File | undefined) => {
    setOpen(false)
    if (!file) return
    setBusy(true)
    try {
      const pkg = await readThemePackage(file)
      const preview_url = pkg.preview ? await uploadStoreImage(ownerId ?? adminId, pkg.preview, "themes") : null
      const { data, error } = await createClient()
        .from("themes")
        .insert({
          name: pkg.name,
          slug: `${slugify(pkg.name) || "theme"}-${Math.random().toString(36).slice(2, 6)}`,
          description: pkg.description,
          tokens: pkg.tokens,
          preview_url,
          is_published: false,
          ...(ownerId ? { owner_id: ownerId } : {}),
        })
        .select("id")
        .single()
      if (error) throw new Error(/row-level security/i.test(error.message) && ownerId ? "You can keep up to 20 uploaded themes. Delete one to add another." : error.message)
      toast.success(`“${pkg.name}” uploaded. Preview it, then publish when ready.`)
      router.push(`${base}/${data.id}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setBusy(false)
      if (zipRef.current) zipRef.current.value = ""
      if (jsonRef.current) jsonRef.current.value = ""
    }
  }

  return (
    <div className="relative">
      <button className="btn-primary" onClick={() => setOpen((o) => !o)} disabled={busy} aria-expanded={open} aria-haspopup="menu">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add theme <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div role="menu" className="surface absolute right-0 z-40 mt-2 w-64 p-1.5 shadow-lg">
            <button role="menuitem" onClick={() => zipRef.current?.click()} className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-[#f2f3ef]">
              <FileArchive className="mt-0.5 size-4 shrink-0" />
              <span>
                <span className="block text-[13px] font-medium">Upload zip file</span>
                <span className="block text-xs text-[#5d6b63]">theme.json + optional preview.png</span>
              </span>
            </button>
            <button role="menuitem" onClick={() => jsonRef.current?.click()} className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-[#f2f3ef]">
              <FileJson className="mt-0.5 size-4 shrink-0" />
              <span>
                <span className="block text-[13px] font-medium">Upload theme.json</span>
                <span className="block text-xs text-[#5d6b63]">Just the design settings</span>
              </span>
            </button>
            <Link role="menuitem" href={`${base}/new`} className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-[#f2f3ef]">
              <Plus className="mt-0.5 size-4 shrink-0" />
              <span>
                <span className="block text-[13px] font-medium">Create blank theme</span>
                <span className="block text-xs text-[#5d6b63]">Build one in the editor</span>
              </span>
            </Link>
          </div>
        </>
      )}
      <input ref={zipRef} type="file" accept=".zip,application/zip" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      <input ref={jsonRef} type="file" accept=".json,application/json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  )
}
