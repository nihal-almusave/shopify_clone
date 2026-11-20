"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import {
  ExternalLink,
  Home,
  Inbox,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  Store,
  Tag,
  Users,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

type Nav = { href: string; label: string; icon: typeof Home; exact?: boolean; children?: { href: string; label: string }[] }

const NAV: Nav[] = [
  { href: "/admin", label: "Home", icon: Home, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Inbox },
  {
    href: "/admin/products",
    label: "Products",
    icon: Tag,
    children: [
      { href: "/admin/products/inventory", label: "Inventory" },
    ],
  },
  { href: "/admin/customers", label: "Customers", icon: Users },
]

export function AdminShell({
  storeName,
  storeSlug,
  email,
  pendingOrders,
  children,
}: {
  storeName: string
  storeSlug: string
  email: string
  pendingOrders: number
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [query, setQuery] = useState("")

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/")

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push("/")
    router.refresh()
  }

  const initials = storeName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const nav = (
    <nav className="flex h-full flex-col gap-0.5 p-2 text-[13px]" onClick={() => setOpen(false)}>
      {NAV.map((item) => {
        const active = isActive(item) && !item.children?.some((c) => pathname.startsWith(c.href))
        const Icon = item.icon
        return (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 font-semibold text-[#303030] transition-colors",
                active ? "bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)]" : "hover:bg-[#f1f1f1]",
              )}
            >
              <Icon className={cn("size-4", active ? "text-[#303030]" : "text-[#4a4a4a]")} />
              <span className="flex-1">{item.label}</span>
              {item.label === "Orders" && pendingOrders > 0 && (
                <span className="rounded-md bg-[#e3e3e3] px-1.5 text-[11px] font-semibold">{pendingOrders}</span>
              )}
            </Link>
            {item.children && isActive(item) && (
              <div className="mt-0.5 ml-6 flex flex-col gap-0.5">
                {item.children.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className={cn(
                      "rounded-lg px-2 py-1 font-medium text-[#616161] hover:bg-[#f1f1f1]",
                      pathname.startsWith(c.href) && "bg-white text-[#303030] font-semibold",
                    )}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <p className="mt-4 mb-1 px-2 text-xs font-semibold text-[#616161]">Sales channels</p>
      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-semibold text-[#303030] hover:bg-[#f1f1f1]">
        <Store className="size-4 text-[#4a4a4a]" />
        <Link href={`/store/${storeSlug}`} target="_blank" className="flex flex-1 items-center justify-between">
          Online Store <ExternalLink className="size-3.5 text-[#8a8a8a]" />
        </Link>
      </div>

      <div className="mt-auto">
        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-1.5 font-semibold text-[#303030]",
            pathname.startsWith("/admin/settings") ? "bg-white" : "hover:bg-[#f1f1f1]",
          )}
        >
          <Settings className="size-4 text-[#4a4a4a]" /> Settings
        </Link>
      </div>
    </nav>
  )

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-topbar px-3 text-white">
        <button
          className="grid size-8 place-items-center rounded-lg hover:bg-white/10 md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>
        <Link href="/admin" className="flex items-center gap-2 md:w-[220px]">
          <Logo className="size-7" />
          <span className="hidden font-display text-lg font-bold tracking-tight sm:inline">shophub</span>
        </Link>

        <form
          className="mx-auto hidden w-full max-w-xl flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault()
            router.push(`/admin/products?q=${encodeURIComponent(query)}`)
          }}
        >
          <label className="flex h-9 items-center gap-2 rounded-lg border border-white/15 bg-[#303030] px-3 text-sm text-white/60 focus-within:border-white/40">
            <Search className="size-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="w-full bg-transparent text-white placeholder:text-white/50 outline-none"
            />
          </label>
        </form>

        <div className="relative ml-auto md:ml-0">
          <button
            onClick={() => setMenu((m) => !m)}
            className="flex items-center gap-2 rounded-lg py-1 pr-2 pl-1 hover:bg-white/10"
          >
            <span className="grid size-7 place-items-center rounded-md bg-[#36fba1] text-xs font-bold text-[#0b3d2c]">
              {initials || "S"}
            </span>
            <span className="hidden max-w-[160px] truncate text-[13px] font-medium sm:inline">{storeName}</span>
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
              <div className="surface absolute right-0 z-50 mt-2 w-64 p-1.5 text-[#303030]">
                <div className="px-2 py-2">
                  <p className="text-[13px] font-semibold">{storeName}</p>
                  <p className="truncate text-xs text-[#616161]">{email}</p>
                </div>
                <div className="my-1 h-px bg-[#ebebeb]" />
                <Link
                  href={`/store/${storeSlug}`}
                  target="_blank"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-[#f1f1f1]"
                >
                  <Store className="size-4" /> View your store
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setMenu(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-[#f1f1f1]"
                >
                  <Settings className="size-4" /> Settings
                </Link>
                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-[#f1f1f1]"
                >
                  <LogOut className="size-4" /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[240px] shrink-0 bg-sidebar md:block">{nav}</aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-sidebar">
              <div className="flex h-14 items-center justify-between px-3">
                <span className="flex items-center gap-2 font-semibold">
                  <Package className="size-4" /> {storeName}
                </span>
                <button onClick={() => setOpen(false)} aria-label="Close navigation" className="grid size-8 place-items-center rounded-lg hover:bg-black/5">
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1">{nav}</div>
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 md:rounded-tl-2xl md:bg-canvas">{children}</main>
      </div>
    </div>
  )
}
