"use client"

import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { CURRENCIES, slugify } from "@/lib/format"
import type { Merchant } from "@/lib/types"
import { Card, Page } from "@/components/admin/ui"
import { uploadStoreImage } from "@/components/admin/upload"

const ACCENTS = ["#008060", "#12201a", "#0b3d2c", "#8051ff", "#e51c00", "#c05717", "#b98900", "#0b7285"]

export function SettingsForm({ merchant }: { merchant: Merchant }) {
  const router = useRouter()
  const initial = {
    store_name: merchant.store_name,
    store_slug: merchant.store_slug,
    description: merchant.description ?? "",
    phone: merchant.phone ?? "",
    announcement: merchant.announcement ?? "",
    accent_color: merchant.accent_color,
    logo_url: merchant.logo_url ?? "",
    banner_url: merchant.banner_url ?? "",
    favicon_url: merchant.favicon_url ?? "",
    currency: merchant.currency,
    tax_rate: String(merchant.tax_rate),
    shipping_rate: String(merchant.shipping_rate),
    free_shipping_threshold: merchant.free_shipping_threshold != null ? String(merchant.free_shipping_threshold) : "",
  }
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    const slug = slugify(form.store_slug)
    if (!form.store_name.trim()) return toast.error("Store name can’t be blank")
    if (!slug) return toast.error("Store URL can’t be blank")
    setSaving(true)
    const { error } = await createClient()
      .from("merchants")
      .update({
        store_name: form.store_name.trim(),
        store_slug: slug,
        description: form.description.trim() || null,
        phone: form.phone.trim() || null,
        announcement: form.announcement.trim() || null,
        accent_color: form.accent_color,
        logo_url: form.logo_url || null,
        banner_url: form.banner_url || null,
        favicon_url: form.favicon_url || null,
        currency: form.currency,
        tax_rate: Number.parseFloat(form.tax_rate) || 0,
        shipping_rate: Number.parseFloat(form.shipping_rate) || 0,
        free_shipping_threshold: form.free_shipping_threshold.trim() ? Number.parseFloat(form.free_shipping_threshold) : null,
      })
      .eq("id", merchant.id)
    setSaving(false)
    if (error) return toast.error(error.code === "23505" ? "That store URL is taken. Try another." : error.message)
    toast.success("Settings saved")
    router.refresh()
  }

  return (
    <>
      {dirty && (
        <div className="fixed inset-x-0 top-0 z-[60] flex h-14 items-center gap-3 bg-topbar px-4 text-white">
          <span className="text-[13px] font-semibold">Unsaved changes</span>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setForm(initial)} className="rounded-lg px-3 py-1.5 text-[13px] font-semibold hover:bg-white/10">
              Discard
            </button>
            <button onClick={save} disabled={saving} className="btn-secondary">
              {saving && <Loader2 className="size-3.5 animate-spin" />} Save
            </button>
          </div>
        </div>
      )}
      <Page title="Settings" narrow>
        <div className="grid gap-6">
          <Section title="Store details" description="Your customers see this on your storefront.">
            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="store_name">Store name</label>
                  <input id="store_name" className="field" value={form.store_name} onChange={(e) => set("store_name", e.target.value)} />
                </div>
                <div>
                  <label className="field-label" htmlFor="phone">Store phone</label>
                  <input id="phone" className="field" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
              </div>
              <label className="field-label mt-4" htmlFor="store_slug">Store URL</label>
              <div className="flex items-stretch overflow-hidden rounded-lg border border-[#8a958e] focus-within:border-[#0b3d2c] focus-within:ring-2 focus-within:ring-[#0b3d2c]/30">
                <span className="flex items-center bg-[#f7f8f5] px-3 text-[13px] text-[#5d6b63]">/store/</span>
                <input id="store_slug" className="w-full px-2 py-1.5 text-[13px] outline-none" value={form.store_slug} onChange={(e) => set("store_slug", e.target.value.toLowerCase())} />
              </div>
              <p className="field-help">Changing this breaks links you’ve already shared.</p>
              <label className="field-label mt-4" htmlFor="description">Store description</label>
              <textarea id="description" rows={3} className="field" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="A sentence or two shown on your homepage hero" />
            </Card>
          </Section>

          <Section title="Brand" description="Logo, cover image and colors used across your Online Store. To change the overall look, go to Online Store → Themes.">
            <Card>
              <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
                <ImagePicker label="Logo" merchantId={merchant.id} value={form.logo_url} onChange={(v) => set("logo_url", v)} square />
                <ImagePicker label="Cover image" merchantId={merchant.id} value={form.banner_url} onChange={(v) => set("banner_url", v)} />
              </div>
              <div className="mt-4 grid gap-4 border-t border-[#eceee9] pt-4 sm:grid-cols-[10rem_1fr]">
                <ImagePicker label="Favicon" merchantId={merchant.id} value={form.favicon_url} onChange={(v) => set("favicon_url", v)} square />
                <div>
                  <p className="field-label">Browser tab preview</p>
                  <TabPreview
                    name={form.store_name || "Your store"}
                    icon={form.favicon_url || form.logo_url}
                    color={form.accent_color}
                  />
                  <p className="field-help mt-2">
                    Shown in browser tabs and bookmarks. Upload a square image (at least 64 × 64 px, PNG works best).
                    Without one, your logo is used, or a letter icon in your accent color.
                  </p>
                </div>
              </div>
              <p className="field-label mt-4">Accent color</p>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("accent_color", c)}
                    aria-label={`Use ${c}`}
                    className={`size-8 rounded-full ring-offset-2 ${form.accent_color === c ? "ring-2 ring-[#12201a]" : ""}`}
                    style={{ background: c }}
                  />
                ))}
                <input type="color" aria-label="Custom accent color" value={form.accent_color} onChange={(e) => set("accent_color", e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-[#d5dad3]" />
              </div>
              <label className="field-label mt-4" htmlFor="announcement">Announcement bar</label>
              <input id="announcement" className="field" value={form.announcement} onChange={(e) => set("announcement", e.target.value)} placeholder="Free shipping on orders over $50" />
            </Card>
          </Section>

          <Section title="Currency & taxes" description="Prices on your store are shown in this currency.">
            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="currency">Store currency</label>
                  <select id="currency" className="field" value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="tax_rate">Tax rate (%)</label>
                  <input id="tax_rate" type="number" min="0" max="100" step="0.01" className="field" value={form.tax_rate} onChange={(e) => set("tax_rate", e.target.value)} />
                  <p className="field-help">Added on top of product prices at checkout.</p>
                </div>
              </div>
            </Card>
          </Section>

          <Section id="shipping" title="Shipping" description="A flat rate per order, with optional free shipping.">
            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="shipping_rate">Flat shipping rate ({form.currency})</label>
                  <input id="shipping_rate" type="number" min="0" step="0.01" className="field" value={form.shipping_rate} onChange={(e) => set("shipping_rate", e.target.value)} />
                </div>
                <div>
                  <label className="field-label" htmlFor="free_shipping_threshold">Free shipping over ({form.currency})</label>
                  <input id="free_shipping_threshold" type="number" min="0" step="0.01" className="field" value={form.free_shipping_threshold} onChange={(e) => set("free_shipping_threshold", e.target.value)} placeholder="Leave blank to disable" />
                </div>
              </div>
            </Card>
          </Section>

          <div className="flex justify-end">
            <button className="btn-primary" disabled={!dirty || saving} onClick={save}>
              {saving && <Loader2 className="size-3.5 animate-spin" />} Save
            </button>
          </div>
        </div>
      </Page>
    </>
  )
}

function Section({ id, title, description, children }: { id?: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-20 gap-3 md:grid-cols-[16rem_1fr]">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-[13px] text-[#5d6b63]">{description}</p>
      </div>
      {children}
    </section>
  )
}

function ImagePicker({
  label,
  value,
  onChange,
  merchantId,
  square,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  merchantId: string
  square?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  return (
    <div>
      <p className="field-label">{label}</p>
      <div className={`group relative overflow-hidden rounded-lg border-2 border-dashed border-[#b9c2bc] bg-[#f7f8f5] ${square ? "aspect-square" : "aspect-[3/1] sm:aspect-auto sm:h-[calc(100%-1.5rem)]"}`}>
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="size-full object-cover" />
            <button type="button" onClick={() => onChange("")} aria-label={`Remove ${label}`} className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-md bg-white shadow">
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <button type="button" onClick={() => ref.current?.click()} className="flex size-full flex-col items-center justify-center gap-1 text-[13px] text-[#5d6b63] hover:bg-[#f2f3ef]">
            {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            Upload
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          setBusy(true)
          try {
            onChange(await uploadStoreImage(merchantId, file, "brand"))
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed")
          } finally {
            setBusy(false)
          }
        }}
      />
    </div>
  )
}

function TabPreview({ name, icon, color }: { name: string; icon: string; color: string }) {
  return (
    <div className="rounded-lg bg-[#dee1e6] px-2 pt-2">
      <div className="flex w-full max-w-[260px] items-center gap-2 rounded-t-lg bg-white px-3 py-2">
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt="" className="size-4 rounded-sm object-cover" />
        ) : (
          <span className="grid size-4 place-items-center rounded-[4px] text-[10px] font-bold text-white" style={{ background: color }}>
            {name.trim()[0]?.toUpperCase() ?? "S"}
          </span>
        )}
        <span className="truncate text-xs text-[#12201a]">{name}</span>
        <span className="ml-auto text-xs text-[#8a958e]">×</span>
      </div>
    </div>
  )
}
