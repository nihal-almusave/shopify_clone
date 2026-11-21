import Link from "next/link"
import type React from "react"
import { ArrowLeft, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function Page({
  title,
  backHref,
  subtitle,
  actions,
  badges,
  children,
  narrow,
}: {
  title: React.ReactNode
  backHref?: string
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  badges?: React.ReactNode
  children: React.ReactNode
  narrow?: boolean
}) {
  return (
    <div className={cn("mx-auto w-full px-4 py-6 sm:px-8 sm:py-8", narrow ? "max-w-[64rem]" : "max-w-[76rem]")}>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Back"
            className="grid size-9 place-items-center rounded-full bg-white text-[#3d4a43] ring-1 ring-[#d5dad3] ring-inset hover:bg-[#f7f8f5]"
          >
            <ArrowLeft className="size-4" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-display text-[28px] leading-tight font-bold tracking-[-0.03em] text-[#12201a]">{title}</h1>
            {badges}
          </div>
          {subtitle && <p className="mt-1 text-sm text-[#5d6b63]">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export function Card({
  title,
  action,
  children,
  className,
  flush,
}: {
  title?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  flush?: boolean
}) {
  return (
    <section className={cn("surface", flush ? "overflow-hidden" : "p-5", className)}>
      {(title || action) && (
        <div className={cn("mb-4 flex items-center justify-between gap-2", flush && "mb-0 px-5 pt-5 pb-4")}>
          {title && <h2 className="text-[15px] font-semibold text-[#12201a]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export type Tone = "success" | "attention" | "warning" | "critical" | "info" | "neutral" | "draft"

const toneClasses: Record<Tone, string> = {
  success: "bg-[#affebf] text-[#014b40]",
  attention: "bg-[#ffef9d] text-[#4f4700]",
  warning: "bg-[#ffd6a4] text-[#5e4200]",
  critical: "bg-[#fedad9] text-[#8e0b21]",
  info: "bg-[#e0f0ff] text-[#00527c]",
  neutral: "bg-[#e3e3e3] text-[#5d6b63]",
  draft: "bg-[#eaf4ff] text-[#004299]",
}

const dotClasses: Record<Tone, string> = {
  success: "bg-[#29845a]",
  attention: "bg-[#8a6116] border-[#8a6116]",
  warning: "bg-[#b28400]",
  critical: "bg-[#e22c38]",
  info: "bg-[#0094d5]",
  neutral: "bg-[#8a958e]",
  draft: "bg-[#0b3d2c]",
}

export function Badge({
  tone = "neutral",
  children,
  hollow,
}: {
  tone?: Tone
  children: React.ReactNode
  /** Hollow dot = incomplete state (e.g. unfulfilled, payment pending) */
  hollow?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          hollow ? "border border-current bg-transparent" : dotClasses[tone],
        )}
      />
      {children}
    </span>
  )
}

export function paymentBadge(status: string) {
  if (status === "paid") return <Badge tone="neutral">Paid</Badge>
  if (status === "refunded") return <Badge tone="neutral">Refunded</Badge>
  return (
    <Badge tone="warning" hollow>
      Payment pending
    </Badge>
  )
}

export function fulfillmentBadge(status: string) {
  if (status === "fulfilled") return <Badge tone="neutral">Fulfilled</Badge>
  return (
    <Badge tone="attention" hollow>
      Unfulfilled
    </Badge>
  )
}

export function productStatusBadge(status: string) {
  if (status === "active") return <Badge tone="success">Active</Badge>
  if (status === "archived") return <Badge tone="neutral">Archived</Badge>
  return <Badge tone="draft">Draft</Badge>
}

export function Thumbnail({ src, alt, size = 40 }: { src?: string | null; alt: string; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-xl border border-[#e3e6df] bg-[#f7f8f5]"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <ImageIcon className="size-4 text-[#8a958e]" aria-hidden />
      )}
    </div>
  )
}

export function EmptyState({
  icon,
  heading,
  children,
  action,
}: {
  icon?: React.ReactNode
  heading: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon && <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-[#f2f3ef] text-[#0b3d2c]">{icon}</div>}
      <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-[#12201a]">{heading}</h3>
      {children && <p className="mt-1 max-w-sm text-[13px] text-[#5d6b63]">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Banner({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warning" | "success" | "critical"
  title: string
  children?: React.ReactNode
}) {
  const styles = {
    info: "bg-[#eaf4ff] border-[#91d0ff]",
    warning: "bg-[#fff1e3] border-[#ffb800]",
    success: "bg-[#cdfee1] border-[#29845a]",
    critical: "bg-[#fee9e8] border-[#e22c38]",
  }[tone]
  return (
    <div className={cn("rounded-xl border-l-4 px-4 py-3", styles)}>
      <p className="text-[13px] font-semibold text-[#12201a]">{title}</p>
      {children && <div className="mt-0.5 text-[13px] text-[#3d4a43]">{children}</div>}
    </div>
  )
}
