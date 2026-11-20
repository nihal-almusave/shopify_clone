import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.next({ request })

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  if (path.startsWith("/admin") && !user) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = "/auth/login"
    redirect.searchParams.set("next", path)
    return NextResponse.redirect(redirect)
  }

  if (user && (path === "/auth/login" || path === "/auth/signup")) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = "/admin"
    redirect.search = ""
    return NextResponse.redirect(redirect)
  }

  return response
}
