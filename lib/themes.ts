import type { CSSProperties } from "react"

export type HeadingFont = "grotesk" | "sans" | "serif" | "mono"
export type Corners = "sharp" | "rounded" | "pill"
export type HeroLayout = "image" | "split" | "minimal"

export type ThemeTokens = {
  background: string
  surface: string
  text: string
  muted: string
  border: string
  accent?: string
  headingFont: HeadingFont
  corners: Corners
  hero: HeroLayout
}

export type Theme = {
  id: string
  name: string
  slug: string
  description: string | null
  preview_url: string | null
  tokens: ThemeTokens
  is_published: boolean
  owner_id: string | null
  created_at: string
  updated_at: string
}

export const DEFAULT_TOKENS: ThemeTokens = {
  background: "#ffffff",
  surface: "#fafafa",
  text: "#171717",
  muted: "#737373",
  border: "#e5e5e5",
  headingFont: "grotesk",
  corners: "rounded",
  hero: "image",
}

export const HEADING_FONTS: Record<HeadingFont, { label: string; stack: string }> = {
  grotesk: { label: "Grotesk (bold, modern)", stack: "var(--font-bricolage), var(--font-inter), system-ui, sans-serif" },
  sans: { label: "Sans (clean)", stack: "var(--font-inter), system-ui, sans-serif" },
  serif: { label: "Serif (classic)", stack: "ui-serif, Georgia, Cambria, 'Times New Roman', serif" },
  mono: { label: "Mono (technical)", stack: "ui-monospace, SFMono-Regular, Menlo, monospace" },
}

const RADII: Record<Corners, { card: string; button: string; label: string }> = {
  sharp: { card: "2px", button: "2px", label: "Sharp" },
  rounded: { card: "1rem", button: "9999px", label: "Rounded" },
  pill: { card: "1.75rem", button: "9999px", label: "Soft & pill" },
}
export const CORNER_LABELS = Object.fromEntries(Object.entries(RADII).map(([k, v]) => [k, v.label])) as Record<Corners, string>
export const HERO_LABELS: Record<HeroLayout, string> = { image: "Full photo", split: "Split (text + photo)", minimal: "Minimal (type only)" }

const MERCHANT_DEFAULT_ACCENT = "#008060"

/** Dark or white text, whichever reads better on the given color (WCAG relative luminance). */
export function readableOn(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  return (1.05) / (L + 0.05) >= (L + 0.05) / 0.05 ? "#ffffff" : "#111111"
}

/** CSS variables for a storefront. The merchant's own accent wins unless they never changed the default. */
export function themeStyle(tokens: ThemeTokens | null | undefined, merchantAccent: string): CSSProperties {
  const t = { ...DEFAULT_TOKENS, ...(tokens ?? {}) }
  const accent = t.accent && merchantAccent.toLowerCase() === MERCHANT_DEFAULT_ACCENT ? t.accent : merchantAccent
  const r = RADII[t.corners] ?? RADII.rounded
  return {
    "--store-bg": t.background,
    "--store-surface": t.surface,
    "--store-text": t.text,
    "--store-muted": t.muted,
    "--store-border": t.border,
    "--store-accent": accent,
    "--store-on-accent": /^#[0-9a-fA-F]{6}$/.test(accent) ? readableOn(accent) : "#ffffff",
    "--store-heading": HEADING_FONTS[t.headingFont]?.stack ?? HEADING_FONTS.grotesk.stack,
    "--store-radius": r.card,
    "--store-btn-radius": r.button,
  } as CSSProperties
}

const HEX = /^#[0-9a-fA-F]{6}$/

/** Validates an uploaded theme JSON. Returns the clean tokens or a readable error. */
export function parseTokens(input: unknown): { ok: true; tokens: ThemeTokens } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Theme tokens must be a JSON object." }
  const o = input as Record<string, unknown>
  for (const k of ["background", "surface", "text", "muted", "border"] as const) {
    if (typeof o[k] !== "string" || !HEX.test(o[k] as string)) return { ok: false, error: `"${k}" must be a color like #1a2b3c.` }
  }
  if (o.accent != null && (typeof o.accent !== "string" || !HEX.test(o.accent))) return { ok: false, error: `"accent" must be a color like #1a2b3c, or left out.` }
  if (!(String(o.headingFont) in HEADING_FONTS)) return { ok: false, error: `"headingFont" must be one of: ${Object.keys(HEADING_FONTS).join(", ")}.` }
  if (!(String(o.corners) in RADII)) return { ok: false, error: `"corners" must be one of: sharp, rounded, pill.` }
  if (!(String(o.hero) in HERO_LABELS)) return { ok: false, error: `"hero" must be one of: image, split, minimal.` }
  return {
    ok: true,
    tokens: {
      background: o.background as string,
      surface: o.surface as string,
      text: o.text as string,
      muted: o.muted as string,
      border: o.border as string,
      ...(o.accent ? { accent: o.accent as string } : {}),
      headingFont: o.headingFont as HeadingFont,
      corners: o.corners as Corners,
      hero: o.hero as HeroLayout,
    },
  }
}
