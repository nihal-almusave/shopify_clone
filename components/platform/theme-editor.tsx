"use client"

import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { Download, Eye, ImagePlus, Loader2, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/format"
import {
  CORNER_LABELS,
  DEFAULT_TOKENS,
  HEADING_FONTS,
  HERO_LABELS,
  parseTokens,
  type Corners,
  type HeadingFont,
  type HeroLayout,
  type Theme,
  type ThemeTokens,
} from "@/lib/themes"
import { Card, Page } from "@/components/admin/ui"
import { ThemeSwatch } from "@/components/admin/theme-swatch"
import { uploadStoreImage } from "@/components/admin/upload"
import { buildThemeZip, downloadBlob } from "@/lib/theme-package"
import { cn } from "@/lib/utils"

const COLORS: { key: keyof ThemeTokens; label: string; help: string }[] = [
  { key: "background", label: "Background", help: "Page background" },
  { key: "surface", label: "Surface", help: "Footer, hero panels, image placeholders" },
  { key: "text", label: "Text", help: "Headings and body text" },
  { key: "muted", label: "Muted text", help: "Prices, captions, hints" },
  { key: "border", label: "Borders", help: "Dividers and outlines" },
]

/**
 * Theme editor for platform admins (theme store) and, with `owner`, for merchants editing
 * their own private themes (no theme-store publishing; previews on their store).
 */
export function ThemeEditor({ theme, adminId, owner }: { theme?: Theme; adminId: string; owner?: { id: string; storeSlug: string } }) {
  const base = owner ? "/admin/themes" : "/platform/themes"
  const previewStore = owner?.storeSlug ?? "demo"
  const router = useRouter()
  const [name, setName] = useState(theme?.name ?? "")
  const [description, setDescription] = useState(theme?.description ?? "")
  const [previewUrl, setPreviewUrl] = useState(theme?.preview_url ?? "")
  const [published, setPublished] = useState(theme?.is_published ?? false)
  const [tokens, setTokens] = useState<ThemeTokens>(theme?.tokens ?? { ...DEFAULT_TOKENS })
  const [useAccent, setUseAccent] = useState(!!theme?.tokens.accent)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof ThemeTokens>(k: K, v: ThemeTokens[K]) => setTokens((t) => ({ ...t, [k]: v }))
  const finalTokens = (): ThemeTokens => {
    const { accent, ...rest } = tokens
    return useAccent ? { ...rest, accent: accent ?? "#008060" } : rest
  }

  const save = async () => {
    if (!name.trim()) return toast.error("Give the theme a name")
    const parsed = parseTokens(finalTokens())
    if (!parsed.ok) return toast.error(parsed.error)
    setSaving(true)
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      preview_url: previewUrl || null,
      tokens: parsed.tokens,
      ...(owner ? {} : { is_published: published }),
    }
    const supabase = createClient()
    const res = theme
      ? await supabase.from("themes").update(payload).eq("id", theme.id).select("id").single()
      : await supabase
          .from("themes")
          .insert({ ...payload, ...(owner ? { owner_id: owner.id } : {}), slug: `${slugify(name) || "theme"}-${Math.random().toString(36).slice(2, 6)}` })
          .select("id")
          .single()
    setSaving(false)
    if (res.error) return toast.error(res.error.message)
    toast.success(theme ? "Theme saved" : "Theme created")
    if (!theme) router.replace(`${base}/${res.data.id}`)
    router.refresh()
  }

  const remove = async () => {
    if (!theme || !confirm(owner ? `Delete “${theme.name}”? If it’s live, your store goes back to the default look.` : `Delete “${theme.name}”? Stores using it go back to the default look.`)) return
    const { error } = await createClient().from("themes").delete().eq("id", theme.id)
    if (error) return toast.error(error.message)
    toast.success("Theme deleted")
    router.push(base)
    router.refresh()
  }

  const exportZip = async () =>
    downloadBlob(await buildThemeZip({ name, description: description || null, tokens: finalTokens(), preview_url: previewUrl || null }), `${slugify(name) || "theme"}.zip`)

  return (
    <Page
      narrow
      backHref={base}
      title={theme ? theme.name : "New theme"}
      actions={
        <>
          {theme && (
            <a href={`/api/theme-preview?store=${previewStore}&theme=${theme.id}`} target="_blank" rel="noopener" className="btn-secondary">
              <Eye className="size-4" /> Preview
            </a>
          )}
          <button className="btn-secondary" onClick={exportZip}>
            <Download className="size-4" /> Download (.zip)
          </button>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />} Save
          </button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="grid content-start gap-4">
          <Card>
            <label className="field-label" htmlFor="name">Name</label>
            <input id="name" className="field" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. Monsoon" />
            <label className="field-label mt-4" htmlFor="desc">Description</label>
            <textarea id="desc" rows={2} maxLength={280} className="field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Who this theme is for, in one sentence" />
          </Card>

          <Card title="Colors">
            <div className="grid gap-4 sm:grid-cols-2">
              {COLORS.map((c) => (
                <ColorField key={c.key} label={c.label} help={c.help} value={tokens[c.key] as string} onChange={(v) => set(c.key, v as never)} />
              ))}
              <div>
                <label className="flex items-center gap-2 text-[13px] font-medium">
                  <input type="checkbox" className="size-4 accent-[#0b3d2c]" checked={useAccent} onChange={(e) => setUseAccent(e.target.checked)} />
                  Suggest an accent color
                </label>
                {useAccent ? (
                  <ColorField label="" help="Used only if the merchant hasn’t picked their own" value={tokens.accent ?? "#008060"} onChange={(v) => set("accent", v)} />
                ) : (
                  <p className="field-help">Off: stores keep their own accent color.</p>
                )}
              </div>
            </div>
          </Card>

          <Card title="Type, shape and layout">
            <label className="field-label" htmlFor="font">Heading font</label>
            <select id="font" className="field" value={tokens.headingFont} onChange={(e) => set("headingFont", e.target.value as HeadingFont)}>
              {Object.entries(HEADING_FONTS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <p className="field-label mt-4">Corners</p>
            <Segmented value={tokens.corners} options={CORNER_LABELS} onChange={(v) => set("corners", v as Corners)} />
            <p className="field-label mt-4">Homepage hero</p>
            <Segmented value={tokens.hero} options={HERO_LABELS} onChange={(v) => set("hero", v as HeroLayout)} />
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <Card title="Live preview" flush>
            <ThemeSwatch tokens={finalTokens()} name="Store name" />
          </Card>

          {!owner && (
          <Card title="Status">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-medium">{published ? "Published" : "Draft"}</span>
                <span className="block text-xs text-[#5d6b63]">{published ? "Merchants can choose it" : "Only you can see it"}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={published}
                aria-label="Published"
                onClick={() => setPublished((p) => !p)}
                className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", published ? "bg-[#0b3d2c]" : "bg-[#c9cfc7]")}
              >
                <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", published ? "translate-x-[22px]" : "translate-x-0.5")} />
              </button>
            </label>
          </Card>
          )}

          <Card title="Preview image (optional)">
            <p className="mb-3 text-xs text-[#5d6b63]">A screenshot shown on the theme card. Without one, merchants see the drawn preview.</p>
            {previewUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="" className="aspect-[16/9] w-full rounded-xl object-cover" />
                <button onClick={() => setPreviewUrl("")} aria-label="Remove preview image" className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white shadow">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#b9c2bc] text-[13px] text-[#5d6b63] hover:bg-[#f7f8f5]"
              >
                {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                Upload image
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setUploading(true)
                try {
                  setPreviewUrl(await uploadStoreImage(owner?.id ?? adminId, f, "themes"))
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Upload failed")
                } finally {
                  setUploading(false)
                }
              }}
            />
          </Card>

          {theme && (
            <button className="btn-critical w-fit" onClick={remove}>
              <Trash2 className="size-4" /> Delete theme
            </button>
          )}
        </div>
      </div>
    </Page>
  )
}

function ColorField({ label, help, value, onChange }: { label: string; help: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value)
  const id = `c-${label || "accent"}`.replace(/\W+/g, "-").toLowerCase()
  return (
    <div>
      {label && <label className="field-label" htmlFor={id}>{label}</label>}
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label || "Accent"} color picker`}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setText(e.target.value)
          }}
          className="h-9 w-11 cursor-pointer rounded-lg border border-[#c9cfc7] bg-white p-0.5"
        />
        <input
          id={id}
          className="field font-mono uppercase"
          value={text}
          maxLength={7}
          onChange={(e) => {
            setText(e.target.value)
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value.toLowerCase())
          }}
        />
      </div>
      <p className="field-help">{help}</p>
    </div>
  )
}

function Segmented({ value, options, onChange }: { value: string; options: Record<string, string>; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-2xl bg-[#f2f3ef] p-1" role="radiogroup">
      {Object.entries(options).map(([k, label]) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={value === k}
          onClick={() => onChange(k)}
          className={cn("rounded-xl px-3 py-1.5 text-[13px] font-medium", value === k ? "bg-white shadow-sm" : "text-[#5d6b63] hover:text-[#12201a]")}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
