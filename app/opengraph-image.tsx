import { ImageResponse } from "next/og"

export const alt = "ShopHub: create your online store"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/** Share card for Facebook, WhatsApp, LinkedIn and X. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0b3d2c", color: "white", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#36fba1", display: "flex" }} />
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>shophub</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, maxWidth: 960 }}>Your shop online, ready today.</div>
          <div style={{ fontSize: 32, marginTop: 24, color: "#b9ffdc" }}>Free online store builder · Cash on delivery · bKash · Bank transfer</div>
        </div>
      </div>
    ),
    size,
  )
}
