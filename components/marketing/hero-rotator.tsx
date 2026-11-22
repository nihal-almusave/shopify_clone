"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Pause, Play } from "lucide-react"
import { HERO_ITEMS } from "./photos"
import { cn } from "@/lib/utils"

const INTERVAL = 3200

export function HeroRotator() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false)
  }, [])

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setIndex((i) => (i + 1) % HERO_ITEMS.length), INTERVAL)
    return () => clearInterval(t)
  }, [playing])

  const current = HERO_ITEMS[index]

  return (
    <section className="relative isolate flex min-h-[min(92svh,860px)] flex-col justify-end overflow-hidden bg-[#0b3d2c] text-white">
      {HERO_ITEMS.map((item, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={item.word}
          src={item.photo}
          alt=""
          aria-hidden
          loading={i === 0 ? "eager" : "lazy"}
          className={cn(
            "absolute inset-0 -z-20 size-full object-cover transition-[opacity,transform] duration-[1200ms] ease-out motion-reduce:transition-none",
            i === index ? "scale-100 opacity-100" : "scale-[1.04] opacity-0",
          )}
          style={{ objectPosition: item.position }}
        />
      ))}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,14,12,.78) 0%, rgba(10,14,12,.5) 40%, rgba(10,14,12,.05) 75%), linear-gradient(0deg, rgba(10,14,12,.65) 0%, transparent 40%)",
        }}
      />

      <div className="mx-auto w-full max-w-[84rem] px-5 pt-36 pb-10 sm:px-8 sm:pb-14">
        <h1 className="font-display text-[clamp(3.5rem,10.5vw,8.25rem)] leading-[0.92] font-bold tracking-[-0.045em]">
          <span className="block">Sell</span>
          <span className="relative block h-[1.02em] overflow-hidden" aria-live="off">
            <span key={current.word} className="hero-word block whitespace-nowrap text-[#b9ffdc]">
              {current.word}
            </span>
          </span>
          <span className="block">online.</span>
        </h1>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <p className="text-lg leading-relaxed text-white/85">
              Whatever you make, cook or curate, ShopHub gives you a store, a checkout and an admin to run it. Free to start.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex h-12 items-center rounded-full bg-[#36fba1] px-6 text-[15px] font-semibold text-[#0b3d2c] transition-colors hover:bg-[#6dfdbc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Create your store
              </Link>
              <Link
                href="/store/demo"
                className="inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold text-white ring-1 ring-white/40 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Browse a demo store
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3" role="group" aria-label="Choose what the headline shows">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="grid size-8 place-items-center rounded-full ring-1 ring-white/40 hover:bg-white/10"
              aria-label={playing ? "Pause rotation" : "Play rotation"}
            >
              {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>
            {HERO_ITEMS.map((item, i) => (
              <button
                key={item.word}
                onClick={() => {
                  setIndex(i)
                  setPlaying(false)
                }}
                aria-label={`Show ${item.word}`}
                aria-pressed={i === index}
                className="group grid h-8 place-items-center"
              >
                <span className={cn("block h-[3px] w-7 rounded-full transition-colors", i === index ? "bg-white" : "bg-white/35 group-hover:bg-white/60")} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
