import type React from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b3d2c]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60rem 40rem at 10% -10%, #36fba1 0%, transparent 55%), radial-gradient(50rem 30rem at 110% 110%, #0e7a55 0%, transparent 60%)",
        }}
      />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <Link href="/" className="mb-6 flex items-center gap-2 text-white">
          <Logo className="size-9" />
          <span className="font-display text-2xl font-bold tracking-tight">shophub</span>
        </Link>
        <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-2xl shadow-black/30">{children}</div>
        <p className="mt-6 text-xs text-white/60">© {new Date().getFullYear()} ShopHub</p>
      </div>
    </div>
  )
}
