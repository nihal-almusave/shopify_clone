"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import { ArrowLeft, BarChart3, Menu, Palette, Store, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/platform", label: "Overview", icon: BarChart3, exact: true },
  { href: "/platform/stores", label: "Stores", icon: Store },
  { href: "/platform/themes", label: "Themes", icon: Palette },
]

export function PlatformShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href))

  const nav = (
    <div className="flex h-full flex-col">
      <Link href="/platform" className="flex h-16 items-center gap-2 px-5">
        <Logo className="size-7" />
        <span className="font-display text-xl font-bold tracking-[-0.03em]">shophub</span>
        <span className="rounded-full bg-[#36fba1] px-2 py-0.5 text-[11px] font-semibold text-[#0b3d2c]">Platform</span>
      </Link>
      <nav className="mt-2 flex-1 px-3 text-sm" aria-label="Platform">
        <ul className="grid gap-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active(href, exact) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 font-medium",
                  active(href, exact) ? "bg-[#0b3d2c] text-white" : "text-[#3d4a43] hover:bg-[#f2f3ef]",
                )}
              >
                <Icon className="size-[18px]" /> {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-[#eceee9] p-3 text-[13px]">
        <Link href="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-[#3d4a43] hover:bg-[#f2f3ef]">
          <ArrowLeft className="size-4" /> My store admin
        </Link>
        <p className="truncate px-3 pt-1 text-xs text-[#8a958e]">{email}</p>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-canvas text-[#12201a]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-[#e3e6df] bg-white lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-label="Navigation">
          <div className="absolute inset-0 bg-[#12201a]/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white">
            <button onClick={() => setOpen(false)} aria-label="Close navigation" className="absolute top-4 right-3 grid size-8 place-items-center rounded-full hover:bg-[#f2f3ef]">
              <X className="size-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="flex h-14 items-center gap-3 border-b border-[#e3e6df] bg-white px-4 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open navigation" className="grid size-9 place-items-center rounded-full ring-1 ring-[#d5dad3]">
            <Menu className="size-[18px]" />
          </button>
          <span className="font-semibold">ShopHub Platform</span>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
