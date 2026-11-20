"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { payForOrder } from "@/lib/checkout"

export function PayNowButton({ orderId }: { orderId: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="mt-5">
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError(null)
          const res = await payForOrder(orderId)
          if (res.ok) window.location.href = res.redirectUrl
          else {
            setError(res.error)
            setBusy(false)
          }
        }}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 sm:w-auto sm:px-8"
        style={{ background: "var(--store-accent)" }}
      >
        {busy && <Loader2 className="size-4 animate-spin" />} Complete payment
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  )
}
