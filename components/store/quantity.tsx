"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function Quantity({
  value,
  onChange,
  max,
  size = "md",
}: {
  value: number
  onChange: (v: number) => void
  max?: number | null
  size?: "sm" | "md"
}) {
  const h = size === "sm" ? "h-8" : "h-11"
  return (
    <div className={cn("inline-flex items-center rounded-full border border-neutral-300", h)}>
      <button type="button" aria-label="Decrease quantity" className="grid h-full w-9 place-items-center rounded-l-full hover:bg-neutral-100" onClick={() => onChange(value - 1)}>
        <Minus className="size-3.5" />
      </button>
      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="grid h-full w-9 place-items-center rounded-r-full hover:bg-neutral-100 disabled:opacity-30"
        disabled={max != null && value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
