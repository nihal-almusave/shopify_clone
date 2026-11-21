import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

/** Handles Supabase email links (PKCE `code` or `token_hash`) and signs the merchant in. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const nextParam = searchParams.get("next") ?? "/admin"
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/admin"

  const supabase = await createClient()
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error("Missing code") }

  if (error) {
    const failed = next === "/auth/update-password" || type === "recovery" ? "/auth/forgot-password?expired=1" : "/auth/login?error=confirm"
    return NextResponse.redirect(`${origin}${failed}`)
  }
  return NextResponse.redirect(`${origin}${type === "recovery" ? "/auth/update-password" : next}`)
}
