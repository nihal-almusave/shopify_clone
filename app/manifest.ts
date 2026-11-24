import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ShopHub: online store builder",
    short_name: "ShopHub",
    description: "Create your online store, take orders and manage your business.",
    start_url: "/admin",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b3d2c",
    icons: [
      { src: "/api/icon?size=192", sizes: "192x192", type: "image/png" },
      { src: "/api/icon?size=512", sizes: "512x512", type: "image/png" },
      { src: "/shophub-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  }
}
