"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { OFFLINE_METHODS, PAYMENT_METHODS, type PaymentMethodId } from "@/lib/payments/methods"
import { Badge, Banner, Card, Page } from "@/components/admin/ui"
import { cn } from "@/lib/utils"

type Row = { method: PaymentMethodId; enabled: boolean; details: Record<string, string> }

export function PaymentsForm({ merchantId, configured }: { merchantId: string; configured: Row[] }) {
  const router = useRouter()
  const neverSetUp = configured.length === 0
  const initial = Object.fromEntries(
    OFFLINE_METHODS.map((m) => {
      const row = configured.find((r) => r.method === m.id)
      // Before any setup, stores accept cash on delivery, so show it switched on.
      return [m.id, { enabled: row ? row.enabled : neverSetUp && m.id === "cod", details: (row?.details ?? {}) as Record<string, string> }]
    }),
  ) as Record<string, { enabled: boolean; details: Record<string, string> }>
  const [state, setState] = useState(initial)
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(state) !== JSON.stringify(initial) || neverSetUp

  const save = async () => {
    for (const m of OFFLINE_METHODS) {
      const s = state[m.id]
      if (!s.enabled) continue
      const missing = m.fields.find((f) => f.required && !s.details[f.key]?.trim())
      if (missing) return toast.error(`${m.name}: add the ${missing.label.toLowerCase()}`)
    }
    if (!OFFLINE_METHODS.some((m) => state[m.id].enabled)) return toast.error("Turn on at least one way for customers to pay")
    setSaving(true)
    const rows = OFFLINE_METHODS.map((m) => ({
      merchant_id: merchantId,
      method: m.id,
      enabled: state[m.id].enabled,
      details: Object.fromEntries(Object.entries(state[m.id].details).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v)),
    }))
    const { error } = await createClient().from("merchant_payment_methods").upsert(rows, { onConflict: "merchant_id,method" })
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success("Payment settings saved")
    router.refresh()
  }

  return (
    <Page
      narrow
      backHref="/admin/settings"
      title="Payments"
      subtitle="Choose how customers can pay you. Money always goes to your own account."
      actions={
        <button className="btn-primary" onClick={save} disabled={saving || !dirty}>
          {saving && <Loader2 className="size-4 animate-spin" />} Save
        </button>
      }
    >
      <div className="grid gap-6">
        <section className="grid gap-3">
          <h2 className="text-[15px] font-semibold">Payment methods you manage</h2>
          {OFFLINE_METHODS.map((m) => {
            const s = state[m.id]
            return (
              <Card key={m.id}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-[13px] text-[#5d6b63]">{m.summary}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={s.enabled}
                    aria-label={`Accept ${m.name}`}
                    onClick={() => setState((st) => ({ ...st, [m.id]: { ...st[m.id], enabled: !st[m.id].enabled } }))}
                    className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", s.enabled ? "bg-[#0b3d2c]" : "bg-[#c9cfc7]")}
                  >
                    <span className={cn("absolute top-0.5 left-0 size-5 rounded-full bg-white shadow transition-transform", s.enabled ? "translate-x-[22px]" : "translate-x-0.5")} />
                  </button>
                </div>
                {s.enabled && m.fields.length > 0 && (
                  <div className="mt-4 grid gap-3 border-t border-[#eceee9] pt-4 sm:grid-cols-2">
                    {m.fields.map((f) => {
                      const id = `${m.id}-${f.key}`
                      const props = {
                        id,
                        className: "field",
                        placeholder: f.placeholder,
                        value: s.details[f.key] ?? "",
                        maxLength: f.multiline ? 400 : 80,
                        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                          setState((st) => ({ ...st, [m.id]: { ...st[m.id], details: { ...st[m.id].details, [f.key]: e.target.value } } })),
                      }
                      return (
                        <div key={f.key} className={f.multiline ? "sm:col-span-2" : ""}>
                          <label className="field-label" htmlFor={id}>
                            {f.label}
                            {f.required && <span className="text-[#b42318]"> *</span>}
                          </label>
                          {f.multiline ? <textarea rows={2} {...props} /> : <input {...props} />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            )
          })}
        </section>

        <section className="grid gap-3">
          <h2 className="text-[15px] font-semibold">Online payment gateways</h2>
          <Banner title="Coming soon">
            Accept online payments automatically, paid straight to your own gateway account. Until then, mark online transfers as paid from the order page.
          </Banner>
          <div className="grid gap-3 sm:grid-cols-3">
            {PAYMENT_METHODS.filter((m) => m.kind === "gateway").map((m) => (
              <Card key={m.id} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{m.name}</p>
                </div>
                <p className="mt-1 text-[13px] text-[#5d6b63]">{m.summary}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <Badge tone="neutral">{m.region}</Badge>
                  <button className="btn-secondary" disabled>Connect</button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </Page>
  )
}
