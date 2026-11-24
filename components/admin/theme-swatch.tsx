import { DEFAULT_TOKENS, HEADING_FONTS, type ThemeTokens } from "@/lib/themes"

/** A tiny drawn preview of a storefront in a theme's colors, fonts and corners. */
export function ThemeSwatch({ tokens, name }: { tokens: ThemeTokens | null; name: string }) {
  const t = { ...DEFAULT_TOKENS, ...(tokens ?? {}) }
  const accent = t.accent ?? "#008060"
  const card = t.corners === "sharp" ? 2 : t.corners === "pill" ? 12 : 8
  const btn = t.corners === "sharp" ? 2 : 999
  return (
    <div aria-hidden className="overflow-hidden" style={{ background: t.background, color: t.text, borderBottom: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${t.border}` }}>
        <span className="text-[11px] font-bold" style={{ fontFamily: HEADING_FONTS[t.headingFont].stack }}>{name}</span>
        <span className="h-1.5 w-8 rounded-full" style={{ background: t.muted, opacity: 0.5 }} />
      </div>
      <div className="px-3 py-3" style={{ background: t.hero === "minimal" ? t.surface : t.background }}>
        <div className="text-[15px] leading-tight font-bold" style={{ fontFamily: HEADING_FONTS[t.headingFont].stack }}>Sell online</div>
        <div className="mt-1 h-1.5 w-20 rounded-full" style={{ background: t.muted, opacity: 0.45 }} />
        <span className="mt-2 inline-block px-2.5 py-1 text-[9px] font-semibold" style={{ background: accent, color: "#fff", borderRadius: btn }}>Shop now</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 px-3 pb-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-square" style={{ background: t.surface, borderRadius: card, border: `1px solid ${t.border}` }} />
        ))}
      </div>
    </div>
  )
}
