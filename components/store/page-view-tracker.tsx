"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

/** Sends one anonymous page view per storefront page. No cookies, nothing stored in the browser. */
export function PageViewTracker({ slug }: { slug: string }) {
  const pathname = usePathname()
  useEffect(() => {
    const body = JSON.stringify({ slug, path: pathname })
    try {
      if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
        fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {})
      }
    } catch {
      // tracking must never break the store
    }
  }, [slug, pathname])
  return null
}
