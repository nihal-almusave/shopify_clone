import { cn } from "@/lib/utils"

/** ShopHub mark: a shopping bag with a rising arrow. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#36fba1" />
      <path d="M10 12h12l-1.2 11.2a2 2 0 0 1-2 1.8h-5.6a2 2 0 0 1-2-1.8L10 12Z" fill="#0b3d2c" />
      <path d="M13 12V10.5a3 3 0 0 1 6 0V12" stroke="#0b3d2c" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="m13.5 20 2.2-2.2 1.6 1.6 2.2-2.4" stroke="#36fba1" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
