import type React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { Logo } from "@/components/logo"

export const metadata: Metadata = { robots: { index: false, follow: true } }

const PHOTO = "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1400&q=75&auto=format&fit=crop"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh bg-white text-[#12201a] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <Link href="/" className="flex w-fit items-center gap-2">
          <Logo className="size-8" />
          <span className="font-display text-[22px] font-bold tracking-[-0.03em]">shophub</span>
        </Link>
        <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">{children}</main>
        <p className="text-xs text-[#8a958e]">
          © {new Date().getFullYear()} ShopHub ·{" "}
          <Link href="/store/demo" className="hover:text-[#12201a] hover:underline">
            See a demo store
          </Link>
        </p>
      </div>

      <aside className="relative hidden overflow-hidden bg-[#0b3d2c] lg:block" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PHOTO} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute right-10 bottom-10 left-10">
          <div className="mb-6 w-fit rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
            <p className="text-xs text-[#5d6b63]">New order · just now</p>
            <div className="mt-1 flex items-center gap-6">
              <p className="font-semibold">#1042 · Mutton kacchi × 2</p>
              <p className="font-display text-lg font-bold">Tk 1,300</p>
            </div>
          </div>
          <p className="max-w-md font-display text-4xl leading-[1.02] font-bold tracking-[-0.035em] text-white">
            Your store, your customers, your next order.
          </p>
        </div>
      </aside>
    </div>
  )
}
