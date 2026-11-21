"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

const MENU = [
  {
    heading: "Build your store",
    links: [
      { href: "#stores", label: "Storefronts", body: "A branded shop at your own link" },
      { href: "#admin", label: "Products & stock", body: "Photos, prices and inventory" },
    ],
  },
  {
    heading: "Sell and get paid",
    links: [
      { href: "#admin", label: "Checkout", body: "Cards or cash on delivery" },
      { href: "#currency", label: "Currencies & tax", body: "Price in taka, rupees, dollars…" },
    ],
  },
  {
    heading: "Run your business",
    links: [
      { href: "#admin", label: "Orders", body: "Mark paid, fulfill, restock" },
      { href: "#admin", label: "Analytics", body: "Sales and average order value" },
    ],
  },
]

export function SiteNav() {
  const [solid, setSolid] = useState(false)
  const [mega, setMega] = useState(false)
  const [mobile, setMobile] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!mega) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(false)
    const onClick = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setMega(false)
    window.addEventListener("keydown", onKey)
    window.addEventListener("click", onClick)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("click", onClick)
    }
  }, [mega])

  const light = solid || mega || mobile

  return (
    <header
      ref={wrap}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-200",
        light ? "bg-white text-[#12201a] shadow-[0_1px_0_rgba(18,32,26,.08)]" : "bg-transparent text-white",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[84rem] items-center gap-8 px-5 sm:px-8" aria-label="Main">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-8" />
          <span className="font-display text-[22px] font-bold tracking-[-0.03em]">shophub</span>
        </Link>

        <div className="hidden items-center gap-1 text-[15px] font-medium md:flex">
          <button
            onClick={() => setMega((m) => !m)}
            aria-expanded={mega}
            aria-controls="mega-menu"
            className={cn("flex items-center gap-1 rounded-full px-3 py-2", light ? "hover:bg-[#f2f3ef]" : "hover:bg-white/10")}
          >
            Product <ChevronDown className={cn("size-4 transition-transform", mega && "rotate-180")} />
          </button>
          <Link href="#steps" className={cn("rounded-full px-3 py-2", light ? "hover:bg-[#f2f3ef]" : "hover:bg-white/10")}>
            How it works
          </Link>
          <Link href="/store/demo" className={cn("rounded-full px-3 py-2", light ? "hover:bg-[#f2f3ef]" : "hover:bg-white/10")}>
            Demo store
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/auth/login" className={cn("hidden rounded-full px-4 py-2 text-[15px] font-medium sm:block", light ? "hover:bg-[#f2f3ef]" : "hover:bg-white/10")}>
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className={cn(
              "rounded-full px-5 py-2.5 text-[15px] font-semibold transition-colors",
              light ? "bg-[#0b3d2c] text-white hover:bg-[#12523c]" : "bg-white text-[#0b3d2c] hover:bg-[#e9fff3]",
            )}
          >
            Start for free
          </Link>
          <button
            className="grid size-10 place-items-center rounded-full md:hidden"
            onClick={() => setMobile((m) => !m)}
            aria-expanded={mobile}
            aria-label={mobile ? "Close menu" : "Open menu"}
          >
            {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {mega && (
        <div id="mega-menu" className="hidden border-t border-[#e6e8e2] bg-white md:block">
          <div className="mx-auto grid max-w-[84rem] grid-cols-[repeat(3,1fr)_1.1fr] gap-10 px-8 py-10">
            {MENU.map((g) => (
              <div key={g.heading}>
                <p className="mb-4 text-sm text-[#5d6b63]">{g.heading}</p>
                <ul className="grid gap-4">
                  {g.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} onClick={() => setMega(false)} className="group block">
                        <span className="font-display text-xl font-semibold tracking-[-0.02em] group-hover:underline">{l.label}</span>
                        <span className="block text-sm text-[#5d6b63]">{l.body}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Link href="/store/demo" onClick={() => setMega(false)} className="group overflow-hidden rounded-2xl bg-[#f2f3ef]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=700&q=70&auto=format&fit=crop" alt="" className="h-32 w-full object-cover" />
              <div className="p-4">
                <p className="font-semibold group-hover:underline">Walk through a live store</p>
                <p className="text-sm text-[#5d6b63]">Add to cart and check out on Northwind Goods.</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {mobile && (
        <div className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-[#e6e8e2] bg-white px-5 pb-8 md:hidden">
          {MENU.map((g) => (
            <div key={g.heading} className="border-b border-[#e6e8e2] py-5">
              <p className="mb-3 text-sm text-[#5d6b63]">{g.heading}</p>
              {g.links.map((l) => (
                <Link key={l.label} href={l.href} onClick={() => setMobile(false)} className="block py-1.5 font-display text-xl font-semibold">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="grid gap-2 pt-5">
            <Link href="/store/demo" className="py-1.5 text-lg font-medium">Demo store</Link>
            <Link href="/auth/login" className="py-1.5 text-lg font-medium">Log in</Link>
          </div>
        </div>
      )}
    </header>
  )
}
