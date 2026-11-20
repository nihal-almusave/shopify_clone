"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)
  if (images.length === 0)
    return <div className="grid aspect-square place-items-center rounded-3xl bg-neutral-100 text-7xl font-bold text-neutral-300">{name.slice(0, 1)}</div>
  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-3xl bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={name} className="size-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn("size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-neutral-100", i === active ? "border-neutral-900" : "border-transparent opacity-70 hover:opacity-100")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
