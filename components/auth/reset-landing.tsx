"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

/**
 * Landing page for the reset email link. Supabase puts a one-time session in the
 * URL fragment (#access_token=…&refresh_token=…&type=recovery). We store it as the
 * normal cookie session, clear it from the address bar, and continue.
 */
export function ResetLanding() {
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    window.history.replaceState(null, "", window.location.pathname)
    const access_token = params.get("access_token")
    const refresh_token = params.get("refresh_token")

    if (params.get("error") || !access_token || !refresh_token) {
      router.replace("/auth/forgot-password?expired=1")
      return
    }
    createClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => router.replace(error ? "/auth/forgot-password?expired=1" : "/auth/update-password"))
  }, [router])

  return (
    <div className="flex flex-col items-center py-6 text-center text-sm text-[#5d6b63]">
      <Loader2 className="mb-3 size-6 animate-spin text-[#0b3d2c]" />
      Opening your password reset…
    </div>
  )
}
