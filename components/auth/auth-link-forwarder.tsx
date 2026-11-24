"use client"

import { useEffect } from "react"

/**
 * Safety net for email links. If Supabase can't use the requested redirect (for
 * example after the site moves to a new domain), it sends people to the Site URL
 * with the session or error in the URL fragment. Whatever page that is, hand the
 * fragment to the right screen instead of silently ignoring it.
 */
export function AuthLinkForwarder() {
  useEffect(() => {
    const hash = window.location.hash
    if (hash.length < 2 || window.location.pathname === "/auth/reset") return
    const params = new URLSearchParams(hash.slice(1))
    if (params.get("access_token") && params.get("refresh_token")) {
      window.location.replace(`/auth/reset${hash}`)
    } else if (params.get("error_code") || params.get("error_description")) {
      window.location.replace("/auth/forgot-password?expired=1")
    }
  }, [])
  return null
}
