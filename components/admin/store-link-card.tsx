"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"

export function StoreLinkCard({ slug, name }: { slug: string; name: string }) {
  const [origin, setOrigin] = useState("")
  const [copied, setCopied] = useState(false)
  useEffect(() => setOrigin(window.location.origin), [])
  const url = `${origin}/store/${slug}`
  const text = encodeURIComponent(`Shop ${name} online: ${url}`)

  return (
    <section className="surface flex flex-col p-5">
      <h2 className="text-[15px] font-semibold">Your store link</h2>
      <p className="mt-1 text-sm text-[#5d6b63]">Share it anywhere your customers are.</p>
      <div className="mt-4 flex items-center gap-2 rounded-full bg-[#f2f3ef] py-1.5 pr-1.5 pl-4">
        <span className="min-w-0 flex-1 truncate text-sm">{url.replace(/^https?:\/\//, "") || `…/store/${slug}`}</span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
          }}
          className="btn-primary h-8 px-3"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href={`https://wa.me/?text=${text}`} target="_blank" rel="noopener noreferrer" className="btn-secondary">
          WhatsApp
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary">
          Facebook
        </a>
      </div>
      <Link href={`/store/${slug}`} target="_blank" className="mt-auto flex items-center gap-1 pt-4 text-[13px] font-medium text-[#0b6e4f] hover:underline">
        Open your store <ExternalLink className="size-3.5" />
      </Link>
    </section>
  )
}
