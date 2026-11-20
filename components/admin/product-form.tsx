"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import { ExternalLink, GripVertical, ImagePlus, Link2, Loader2, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { formatMoney } from "@/lib/format"
import type { Product, ProductStatus } from "@/lib/types"
import { Card, Page, productStatusBadge } from "@/components/admin/ui"
import { uploadStoreImage } from "@/components/admin/upload"

type FormState = {
  name: string
  description: string
  price: string
  compare_at_price: string
  cost: string
  sku: string
  quantity: string
  track_inventory: boolean
  category: string
  vendor: string
  status: ProductStatus
  images: string[]
}

const toState = (p?: Product): FormState => ({
  name: p?.name ?? "",
  description: p?.description ?? "",
  price: p ? String(p.price) : "",
  compare_at_price: p?.compare_at_price != null ? String(p.compare_at_price) : "",
  cost: p?.cost != null ? String(p.cost) : "",
  sku: p?.sku ?? "",
  quantity: p ? String(p.quantity) : "0",
  track_inventory: p?.track_inventory ?? true,
  category: p?.category ?? "",
  vendor: p?.vendor ?? "",
  status: p?.status ?? "active",
  images: p?.images ?? [],
})

const num = (v: string) => (v.trim() === "" ? null : Number.parseFloat(v))

export function ProductForm({
  product,
  merchantId,
  currency,
  storeSlug,
}: {
  product?: Product
  merchantId: string
  currency: string
  storeSlug: string
}) {
  const router = useRouter()
  const initial = useMemo(() => toState(product), [product])
  const [form, setForm] = useState<FormState>(initial)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  const price = num(form.price) ?? 0
  const cost = num(form.cost)
  const profit = cost != null ? price - cost : null
  const margin = cost != null && price > 0 ? ((price - cost) / price) * 100 : null

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) urls.push(await uploadStoreImage(merchantId, file, "products"))
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const addUrl = () => {
    const url = imageUrl.trim()
    if (!/^https?:\/\//i.test(url)) {
      toast.error("Enter an image URL starting with http(s)://")
      return
    }
    setForm((f) => ({ ...f, images: [...f.images, url] }))
    setImageUrl("")
  }

  const moveImage = (from: number, to: number) => {
    setForm((f) => {
      const images = [...f.images]
      const [m] = images.splice(from, 1)
      images.splice(to, 0, m)
      return { ...f, images }
    })
  }

  const save = async () => {
    if (!form.name.trim()) return toast.error("Title can’t be blank")
    if (form.price.trim() === "" || Number.isNaN(price) || price < 0) return toast.error("Enter a valid price")

    setSaving(true)
    const payload = {
      merchant_id: merchantId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price,
      compare_at_price: num(form.compare_at_price),
      cost,
      sku: form.sku.trim() || null,
      quantity: Number.parseInt(form.quantity || "0", 10) || 0,
      track_inventory: form.track_inventory,
      category: form.category.trim() || null,
      vendor: form.vendor.trim() || null,
      status: form.status,
      images: form.images,
    }
    const supabase = createClient()
    const { data, error } = product
      ? await supabase.from("products").update(payload).eq("id", product.id).select("id").single()
      : await supabase.from("products").insert(payload).select("id").single()
    setSaving(false)

    if (error) {
      toast.error(error.code === "23505" ? "That SKU is already used by another product" : error.message)
      return
    }
    toast.success(product ? "Product saved" : "Product created")
    if (!product) router.replace(`/admin/products/${data.id}`)
    router.refresh()
  }

  const remove = async () => {
    if (!product || !confirm(`Delete “${product.name}”? This can’t be undone.`)) return
    const { error } = await createClient().from("products").delete().eq("id", product.id)
    if (error) return toast.error(error.message)
    toast.success("Product deleted")
    router.push("/admin/products")
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

      <Page
        narrow
        backHref="/admin/products"
        title={product ? product.name : "Add product"}
        badges={product && productStatusBadge(product.status)}
        actions={
          product && (
            <Link href={`/store/${storeSlug}/products/${product.id}`} target="_blank" className="btn-secondary">
              Preview <ExternalLink className="size-3.5" />
            </Link>
          )
        }
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
          <div className="grid content-start gap-4">
            <Card>
              <label className="field-label" htmlFor="name">Title</label>
              <input id="name" className="field" placeholder="Short sleeve t-shirt" value={form.name} onChange={(e) => set("name", e.target.value)} />
              <label className="field-label mt-4" htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={6}
                className="field resize-y"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Tell customers what makes this product special"
              />
            </Card>

            <Card title="Media">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {form.images.map((src, i) => (
                  <div
                    key={src + i}
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex != null && dragIndex !== i) moveImage(dragIndex, i)
                      setDragIndex(null)
                    }}
                    className={`group relative aspect-square overflow-hidden rounded-lg border border-[#e3e3e3] bg-[#f7f7f7] ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="size-full object-cover" />
                    <GripVertical className="absolute top-1.5 left-1.5 size-4 cursor-grab text-white opacity-0 drop-shadow group-hover:opacity-100" />
                    <button
                      type="button"
                      onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                      className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-md bg-white/90 opacity-0 shadow group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (dragIndex == null) onFiles(e.dataTransfer.files)
                  }}
                  className={`grid aspect-square place-items-center rounded-lg border-2 border-dashed border-[#b5b5b5] text-[13px] text-[#616161] hover:bg-[#f7f7f7] ${form.images.length === 0 ? "col-span-3 aspect-[3/1] sm:col-span-4" : ""}`}
                >
                  {uploading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <span className="flex flex-col items-center gap-1">
                      <ImagePlus className="size-5" />
                      {form.images.length === 0 ? "Upload images or drop files here" : "Add"}
                    </span>
                  )}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
              <div className="mt-3 flex gap-2">
                <label className="flex flex-1 items-center gap-2 rounded-lg border border-[#d4d4d4] px-2.5">
                  <Link2 className="size-4 text-[#8a8a8a]" />
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
                    placeholder="…or paste an image URL"
                    className="w-full py-1.5 text-[13px] outline-none"
                  />
                </label>
                <button type="button" onClick={addUrl} className="btn-secondary">Add URL</button>
              </div>
            </Card>

            <Card title="Pricing">
              <div className="grid gap-4 sm:grid-cols-2">
                <MoneyField label="Price" value={form.price} onChange={(v) => set("price", v)} currency={currency} />
                <MoneyField label="Compare-at price" value={form.compare_at_price} onChange={(v) => set("compare_at_price", v)} currency={currency} help="Shows as a sale price when higher than Price" />
              </div>
              <div className="mt-4 grid gap-4 border-t border-[#ebebeb] pt-4 sm:grid-cols-3">
                <MoneyField label="Cost per item" value={form.cost} onChange={(v) => set("cost", v)} currency={currency} help="Customers won’t see this" />
                <ReadOnly label="Profit" value={profit != null ? formatMoney(profit, currency) : "--"} />
                <ReadOnly label="Margin" value={margin != null ? `${margin.toFixed(1)}%` : "--"} />
              </div>
            </Card>

            <Card title="Inventory">
              <label className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" className="size-4 accent-[#303030]" checked={form.track_inventory} onChange={(e) => set("track_inventory", e.target.checked)} />
                Track quantity
              </label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {form.track_inventory && (
                  <div>
                    <label className="field-label" htmlFor="quantity">Quantity</label>
                    <input id="quantity" type="number" className="field" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
                  </div>
                )}
                <div>
                  <label className="field-label" htmlFor="sku">SKU (Stock Keeping Unit)</label>
                  <input id="sku" className="field" value={form.sku} onChange={(e) => set("sku", e.target.value)} />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid content-start gap-4">
            <Card title="Status">
              <select className="field" value={form.status} onChange={(e) => set("status", e.target.value as ProductStatus)}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <p className="field-help">
                {form.status === "active" ? "Visible on your Online Store." : "Hidden from your Online Store."}
              </p>
            </Card>
            <Card title="Product organization">
              <label className="field-label" htmlFor="category">Category</label>
              <input id="category" className="field" placeholder="e.g. T-shirts" value={form.category} onChange={(e) => set("category", e.target.value)} />
              <label className="field-label mt-3" htmlFor="vendor">Vendor</label>
              <input id="vendor" className="field" value={form.vendor} onChange={(e) => set("vendor", e.target.value)} />
            </Card>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#e3e3e3] pt-4">
          {product ? (
            <button onClick={remove} className="btn-critical">
              <Trash2 className="size-3.5" /> Delete product
            </button>
          ) : (
            <span />
          )}
          <button onClick={save} disabled={saving || (!dirty && !!product)} className="btn-primary">
            {saving && <Loader2 className="size-3.5 animate-spin" />} Save
          </button>
        </div>
      </Page>
    </>
  )
}

function MoneyField({
  label,
  value,
  onChange,
  currency,
  help,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  currency: string
  help?: string
}) {
  const id = label.toLowerCase().replace(/\W+/g, "-")
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[13px] text-[#616161]">{currency}</span>
        <input
          id={id}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          className="field pl-12"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {help && <p className="field-help">{help}</p>}
    </div>
  )
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <p className="rounded-lg bg-[#f7f7f7] px-3 py-1.5 text-[13px] text-[#616161]">{value}</p>
    </div>
  )
}
