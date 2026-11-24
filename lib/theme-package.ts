import { strFromU8, strToU8, unzipSync, zipSync } from "fflate"
import { parseTokens, type ThemeTokens } from "@/lib/themes"

/*
 * ShopHub theme package (like a Shopify theme .zip, but design settings only, no code):
 *
 *   my-theme.zip
 *   ├── theme.json     { "name", "description", "tokens": { … } }   (required)
 *   ├── preview.png    shown on theme cards (optional; .png/.jpg/.webp)
 *   └── README.txt     anything else is ignored
 *
 * A bare theme.json file can be uploaded too.
 */

export type ThemePackage = {
  name: string
  description: string | null
  tokens: ThemeTokens
  preview: File | null
}

const MAX_ZIP = 5 * 1024 * 1024
const PREVIEW = /(^|\/)(preview|screenshot|cover)\.(png|jpe?g|webp)$/i

export async function readThemePackage(file: File): Promise<ThemePackage> {
  const isZip = /\.zip$/i.test(file.name) || file.type.includes("zip")
  let json: Record<string, unknown>
  let preview: File | null = null

  if (isZip) {
    if (file.size > MAX_ZIP) throw new Error("Theme zip files must be under 5 MB.")
    let entries: Record<string, Uint8Array>
    try {
      entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
        filter: (f) => !f.name.startsWith("__MACOSX/") && (f.name.endsWith("theme.json") || PREVIEW.test(f.name)) && f.originalSize < MAX_ZIP,
      })
    } catch {
      throw new Error("That file isn’t a valid zip.")
    }
    const names = Object.keys(entries)
    const themeJson = names.filter((n) => /(^|\/)theme\.json$/.test(n)).sort((a, b) => a.split("/").length - b.split("/").length)[0]
    if (!themeJson) throw new Error("The zip needs a theme.json file at its top level.")
    try {
      json = JSON.parse(strFromU8(entries[themeJson]))
    } catch {
      throw new Error("theme.json isn’t valid JSON.")
    }
    const img = names.find((n) => PREVIEW.test(n))
    if (img) {
      const ext = img.split(".").pop()!.toLowerCase()
      const type = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`
      preview = new File([entries[img] as BlobPart], `preview.${ext}`, { type })
    }
  } else {
    if (file.size > 50_000) throw new Error("Theme JSON files must be under 50 KB.")
    try {
      json = JSON.parse(await file.text())
    } catch {
      throw new Error("That file isn’t valid JSON.")
    }
  }

  const name = String(json.name ?? "").trim().slice(0, 60)
  if (!name) throw new Error("theme.json needs a \"name\".")
  const parsed = parseTokens(json.tokens ?? json)
  if (!parsed.ok) throw new Error(parsed.error)
  return {
    name,
    description: json.description ? String(json.description).slice(0, 280) : null,
    tokens: parsed.tokens,
    preview,
  }
}

/** Builds a theme .zip (theme.json + preview image when available) for download. */
export async function buildThemeZip(theme: { name: string; description: string | null; tokens: ThemeTokens; preview_url?: string | null }) {
  const files: Record<string, Uint8Array> = {
    "theme.json": strToU8(JSON.stringify({ name: theme.name, description: theme.description ?? "", tokens: theme.tokens }, null, 2)),
    "README.txt": strToU8(
      "ShopHub theme package\n\ntheme.json  - name, description and design tokens (required)\npreview.png - image shown on theme cards (optional)\n\nUpload it in Platform -> Themes -> Add theme -> Upload zip file.\n",
    ),
  }
  if (theme.preview_url) {
    try {
      const res = await fetch(theme.preview_url)
      if (res.ok) {
        const ext = (res.headers.get("content-type") ?? "image/png").split("/")[1]?.replace("jpeg", "jpg") ?? "png"
        files[`preview.${ext}`] = new Uint8Array(await res.arrayBuffer())
      }
    } catch {
      // preview is optional
    }
  }
  return new Blob([zipSync(files) as BlobPart], { type: "application/zip" })
}

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
