"use client"

import { useEffect, useRef, useState } from "react"
import { X, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const closeButton = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!zoomed) return
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeButton.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false)
      if (event.key === "ArrowRight") setActive((index) => (index + 1) % images.length)
      if (event.key === "ArrowLeft") setActive((index) => (index - 1 + images.length) % images.length)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
      previousFocus.current?.focus()
    }
  }, [zoomed, images.length])

  if (images.length === 0) {
    return <div className="grid aspect-square place-items-center rounded-3xl bg-neutral-100 text-7xl font-bold text-neutral-300">{name.slice(0, 1)}</div>
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setZoomed(true)}
        aria-label="Enlarge product image"
        className="group relative block aspect-square w-full overflow-hidden rounded-3xl bg-neutral-100 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={name} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn className="size-3.5" /> Zoom image
        </span>
      </button>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1" aria-label="Product images">
          {images.map((src, index) => (
            <button
              key={src + index}
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              aria-pressed={index === active}
              className={cn("size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900", index === active ? "border-neutral-900" : "border-transparent opacity-70 hover:opacity-100")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoomed && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={`${name} image viewer`} onClick={() => setZoomed(false)}>
          <button ref={closeButton} type="button" onClick={() => setZoomed(false)} aria-label="Close image viewer" className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <X className="size-5" />
          </button>
          <p className="absolute top-5 left-5 text-sm text-white/75">{active + 1} / {images.length}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[active]} alt={name} onClick={(event) => event.stopPropagation()} className="max-h-[88vh] max-w-full rounded-xl object-contain" />
          {images.length > 1 && (
            <div className="absolute inset-x-4 bottom-5 flex justify-center gap-2">
              <button type="button" onClick={(event) => { event.stopPropagation(); setActive((index) => (index - 1 + images.length) % images.length) }} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">Previous</button>
              <button type="button" onClick={(event) => { event.stopPropagation(); setActive((index) => (index + 1) % images.length) }} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
