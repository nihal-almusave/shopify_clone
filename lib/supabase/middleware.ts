import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, just pass through without auth middleware
  if (!url || !key) {
    console.warn("[v0] Supabase env vars missing in middleware, skipping auth check")
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if accessing protected merchant routes without auth
  if (
    (request.nextUrl.pathname.startsWith("/merchant") || request.nextUrl.pathname.startsWith("/dashboard")) &&
    !user &&
    !request.nextUrl.pathname.startsWith("/merchant/auth")
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/merchant/auth/login"
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (user && request.nextUrl.pathname.startsWith("/merchant/auth")) {
    const url = request.nextUrl.clone()
    url.pathname = "/merchant/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
