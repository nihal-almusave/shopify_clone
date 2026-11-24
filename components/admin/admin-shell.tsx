"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { BarChart3, ChevronsUpDown, ExternalLink, Home, Inbox, KeyRound, LogOut, Menu, Palette, Search, Settings, Tag, Users, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

type Nav = { href: string; label: string; icon: typeof Home; exact?: boolean; children?: { href: string; label: string }[] }

const NAV: Nav[] = [
  { href: "/admin", label: "Home", icon: Home, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Inbox },
  { href: "/admin/products", label: "Products", icon: Tag, children: [{ href: "/admin/products/inventory", label: "Inventory" }] },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/themes", label: "Online Store", icon: Palette },
]

type Store = { name: string; slug: string; accent: string; logo: string | null }

export function AdminShell({
  store,
  email,
  pendingOrders,
  isPlatformAdmin = false,
  children,
}: {
  store: Store
  email: string
  pendingOrders: number
  isPlatformAdmin?: boolean
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [drawer, setDrawer] = useState(false)
  const [account, setAccount] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    setDrawer(false)
    setAccount(false)
  }, [pathname])

  useEffect(() => {
    if (!drawer && !account) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawer(false)
        setAccount(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [drawer, account])

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"))

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push("/")
    router.refresh()
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex h-16 shrink-0 items-center gap-2 px-5">
        <Logo className="size-7" />
        <span className="font-display text-xl font-bold tracking-[-0.03em]">shophub</span>
      </Link>

      {/* Store card */}
      <div className="mx-3 rounded-2xl bg-[#f2f3ef] p-3">
        <div className="flex items-center gap-2.5">
          {store.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo} alt="" className="size-9 rounded-xl object-cover" />
          ) : (
            <span className="grid size-9 place-items-center rounded-xl text-sm font-bold text-white" style={{ background: store.accent }}>
              {store.name.trim()[0]?.toUpperCase() ?? "S"}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{store.name}</p>
            <Link
              href={`/store/${store.slug}`}
              target="_blank"
              className="flex items-center gap-1 truncate text-xs text-[#5d6b63] hover:text-[#0b6e4f] hover:underline"
            >
              /store/{store.slug} <ExternalLink className="size-3 shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-3 text-sm" aria-label="Admin">
        <ul className="grid gap-0.5">
          {NAV.map((item) => {
            const childActive = item.children?.some((c) => isActive(c.href))
            const active = isActive(item.href, item.exact) && !childActive
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 font-medium transition-colors",
                    active ? "bg-[#0b3d2c] text-white" : "text-[#3d4a43] hover:bg-[#f2f3ef] hover:text-[#12201a]",
                  )}
                >
                  <Icon className="size-[18px]" />
                  <span className="flex-1">{item.label}</span>
                  {item.label === "Orders" && pendingOrders > 0 && (
                    <span
                      className={cn("rounded-full px-2 text-[11px] font-semibold", active ? "bg-white/20" : "bg-[#36fba1] text-[#0b3d2c]")}
                      aria-label={`${pendingOrders} to fulfill`}
                    >
                      {pendingOrders}
                    </span>
                  )}
                </Link>
                {item.children && isActive(item.href) && (
                  <ul className="mt-0.5 ml-[30px] grid gap-0.5 border-l border-[#e3e6df] pl-3">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          aria-current={isActive(c.href) ? "page" : undefined}
                          className={cn(
                            "block rounded-lg px-2 py-1.5",
                            isActive(c.href) ? "font-semibold text-[#0b3d2c]" : "text-[#5d6b63] hover:text-[#12201a]",
                          )}
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
        {isPlatformAdmin && (
          <>
            <p className="mt-5 mb-1 px-3 text-xs font-medium text-[#8a958e]">ShopHub platform</p>
            <Link
              href="/platform"
              className="flex items-center gap-3 rounded-xl px-3 py-2 font-medium text-[#0b3d2c] hover:bg-[#f2f3ef]"
            >
              <BarChart3 className="size-[18px]" />
              <span className="flex-1">Platform dashboard</span>
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-0.5 border-t border-[#eceee9] p-3 text-sm">
        <Link
          href="/admin/settings"
          aria-current={isActive("/admin/settings") ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 font-medium",
            isActive("/admin/settings") ? "bg-[#0b3d2c] text-white" : "text-[#3d4a43] hover:bg-[#f2f3ef]",
          )}
        >
          <Settings className="size-[18px]" /> Settings
        </Link>
        <div className="relative">
          <button
            onClick={() => setAccount((a) => !a)}
            aria-expanded={account}
            aria-label="Account menu"
            aria-controls="admin-account-menu"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-[#f2f3ef]"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#dcfce9] text-xs font-bold text-[#0b3d2c]">
              {email[0]?.toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-[#3d4a43]">{email}</span>
            <ChevronsUpDown className="size-4 text-[#8a958e]" />
          </button>
          {account && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setAccount(false)} />
              <div id="admin-account-menu" role="group" aria-label="Account options" className="surface absolute bottom-full left-0 z-50 mb-2 w-full p-1.5 shadow-lg">
                {isPlatformAdmin && (
                  <Link href="/platform" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#0b3d2c] hover:bg-[#f2f3ef]">
                    <BarChart3 className="size-4" /> Platform dashboard
                  </Link>
                )}
                <Link href="/auth/update-password" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] hover:bg-[#f2f3ef]">
                  <KeyRound className="size-4" /> Change password
                </Link>
                <button onClick={signOut} role="menuitem" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] hover:bg-[#f2f3ef]">
                  <LogOut className="size-4" /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-canvas text-[#12201a]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[#e3e6df] bg-white lg:block">{sidebar}</aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-[#12201a]/40" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-[284px] bg-white shadow-xl">
            <button
              onClick={() => setDrawer(false)}
              aria-label="Close navigation"
              className="absolute top-4 right-3 grid size-8 place-items-center rounded-full hover:bg-[#f2f3ef]"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e3e6df] bg-[#f2f3ef]/85 px-4 backdrop-blur sm:px-8">
          <button
            className="grid size-9 place-items-center rounded-full bg-white ring-1 ring-[#d5dad3] lg:hidden"
            onClick={() => setDrawer(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-[18px]" />
          </button>
          <Link href="/admin" className="lg:hidden">
            <Logo className="size-7" />
          </Link>
          <form
            className="w-full max-w-md"
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              router.push(`/admin/products?q=${encodeURIComponent(query)}`)
            }}
          >
            <label className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm ring-1 ring-[#e3e6df] focus-within:ring-2 focus-within:ring-[#0b3d2c]/30">
              <Search className="size-4 text-[#8a958e]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className="w-full bg-transparent outline-none placeholder:text-[#8a958e]"
              />
            </label>
          </form>
          <Link href={`/store/${store.slug}`} target="_blank" className="btn-secondary ml-auto hidden sm:inline-flex">
            View store <ExternalLink className="size-3.5" />
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
