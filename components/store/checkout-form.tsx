"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, CreditCard, Landmark, Loader2, Lock } from "lucide-react"
import { formatMoney } from "@/lib/format"
import type { Storefront } from "@/lib/types"
import { placeOrder } from "@/lib/checkout"
import { useCart } from "@/components/store/cart"
import { CheckoutHeader } from "@/components/store/checkout-header"
import { cn } from "@/lib/utils"

const COUNTRIES = [
  "Bangladesh", "United States", "Canada", "United Kingdom", "Australia", "New Zealand", "Germany", "France", "Netherlands",
  "Spain", "Italy", "Ireland", "India", "Singapore", "Japan", "United Arab Emirates", "Other",
]

const input =
  "peer w-full rounded-lg border border-neutral-300 bg-white px-3 pt-5 pb-1.5 text-sm outline-none transition focus:border-[var(--store-accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--store-accent)_25%,transparent)]"

function Field({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn("relative block", className)}>
      <input {...props} placeholder=" " className={input} />
      <span className="pointer-events-none absolute top-1.5 left-3 text-[11px] text-neutral-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px]">
        {label}
      </span>
    </label>
  )
}

export function CheckoutForm({ store, cardPayments }: { store: Storefront; cardPayments: boolean }) {
  const { lines, ready, subtotal, clear } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [f, setF] = useState({
    email: "", accepts_marketing: false, country: "", first_name: "", last_name: "",
    address1: "", address2: "", city: "", province: "", postal_code: "", phone: "", note: "",
  })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }))

  const money = (v: number) => formatMoney(v, store.currency)
  const shipping = store.free_shipping_threshold != null && subtotal >= store.free_shipping_threshold ? 0 : Number(store.shipping_rate)
  const tax = Math.round(subtotal * Number(store.tax_rate)) / 100
  const total = subtotal + shipping + tax

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const res = await placeOrder({
      storeSlug: store.store_slug,
      items: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity })),
      customer: { email: f.email, first_name: f.first_name, last_name: f.last_name, phone: f.phone, accepts_marketing: f.accepts_marketing },
      shipping: {
        first_name: f.first_name, last_name: f.last_name, address1: f.address1, address2: f.address2,
        city: f.city, province: f.province, postal_code: f.postal_code, country: f.country,
      },
      note: f.note,
    })
    if (!res.ok) {
      setError(res.error)
      setSubmitting(false)
      return
    }
    clear()
    window.location.href = res.redirectUrl
  }

  const summary = (
    <div>
      <ul className="grid gap-4">
        {lines.map((l) => (
          <li key={l.productId} className="flex items-center gap-4">
            <div className="relative size-16 shrink-0 rounded-lg border border-neutral-200 bg-white">
              {l.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.image} alt="" className="size-full rounded-lg object-cover" />
              )}
              <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-neutral-600 text-[11px] font-semibold text-white">{l.quantity}</span>
            </div>
            <p className="flex-1 text-sm font-medium">{l.name}</p>
            <p className="text-sm">{money(l.price * l.quantity)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-6 grid grid-cols-[1fr_auto] gap-y-2 text-sm">
        <dt>Subtotal</dt>
        <dd className="text-right">{money(subtotal)}</dd>
        <dt>Shipping</dt>
        <dd className="text-right">{shipping === 0 ? "Free" : money(shipping)}</dd>
        {tax > 0 && (
          <>
            <dt>Estimated taxes</dt>
            <dd className="text-right">{money(tax)}</dd>
          </>
        )}
        <dt className="pt-2 text-lg font-semibold">Total</dt>
        <dd className="pt-2 text-right text-lg font-semibold">
          <span className="mr-1.5 text-xs font-normal text-neutral-500">{store.currency}</span>
          {money(total)}
        </dd>
      </dl>
    </div>
  )

  if (ready && lines.length === 0)
    return (
      <>
        <CheckoutHeader store={store} />
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold">Your cart is empty</h1>
          <Link href={`/store/${store.store_slug}`} className="mt-6 inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold text-white" style={{ background: "var(--store-accent)" }}>
            Continue shopping
          </Link>
        </div>
      </>
    )

  return (
    <>
      <CheckoutHeader store={store} />
      {/* Mobile order summary toggle */}
      <button onClick={() => setShowSummary((s) => !s)} className="flex w-full items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-4 text-sm lg:hidden">
        <span className="flex items-center gap-1" style={{ color: "var(--store-accent)" }}>
          {showSummary ? "Hide" : "Show"} order summary <ChevronDown className={cn("size-4 transition", showSummary && "rotate-180")} />
        </span>
        <span className="font-semibold">{money(total)}</span>
      </button>
      {showSummary && <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-6 lg:hidden">{summary}</div>}

      <div className="lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_minmax(0,1fr)]">
        <div className="flex justify-end">
          <form onSubmit={submit} className="w-full max-w-[560px] px-4 py-8 sm:px-6 lg:pr-12 lg:pl-6">
            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-xl font-semibold">Contact</h2>
              </div>
              <Field label="Email" type="email" autoComplete="email" required value={f.email} onChange={set("email")} />
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4" style={{ accentColor: "var(--store-accent)" }} checked={f.accepts_marketing} onChange={set("accepts_marketing")} />
                Email me with news and offers
              </label>
            </section>

            <section className="mt-8">
              <h2 className="mb-3 text-xl font-semibold">Delivery</h2>
              <div className="grid gap-3">
                <label className="relative block">
                  <select value={f.country} onChange={set("country")} className={cn(input, "appearance-none")} autoComplete="country-name" required>
                    <option value="" disabled>Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute top-1.5 left-3 text-[11px] text-neutral-500">Country/Region</span>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-500" />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="First name" autoComplete="given-name" required value={f.first_name} onChange={set("first_name")} />
                  <Field label="Last name" autoComplete="family-name" required value={f.last_name} onChange={set("last_name")} />
                </div>
                <Field label="Address" autoComplete="address-line1" required value={f.address1} onChange={set("address1")} />
                <Field label="Apartment, suite, etc. (optional)" autoComplete="address-line2" value={f.address2} onChange={set("address2")} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="City" autoComplete="address-level2" required value={f.city} onChange={set("city")} />
                  <Field label="State / Province" autoComplete="address-level1" value={f.province} onChange={set("province")} />
                  <Field label="Postal code" autoComplete="postal-code" required value={f.postal_code} onChange={set("postal_code")} />
                </div>
                <Field label="Phone (optional)" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} />
              </div>
            </section>

            <section className="mt-8">
              <h2 className="mb-3 text-xl font-semibold">Shipping method</h2>
              <div className="flex items-center justify-between rounded-lg border px-4 py-4 text-sm" style={{ borderColor: "var(--store-accent)", background: "color-mix(in srgb, var(--store-accent) 6%, white)" }}>
                <span>{shipping === 0 ? "Free shipping" : "Standard shipping"}</span>
                <span className="font-semibold">{shipping === 0 ? "Free" : money(shipping)}</span>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold">Payment</h2>
              <p className="mb-3 flex items-center gap-1 text-sm text-neutral-500">
                <Lock className="size-3.5" /> All transactions are secure and encrypted.
              </p>
              <div className="rounded-lg border px-4 py-4 text-sm" style={{ borderColor: "var(--store-accent)", background: "color-mix(in srgb, var(--store-accent) 6%, white)" }}>
                {cardPayments ? (
                  <p className="flex items-center gap-2 font-medium"><CreditCard className="size-4" /> Credit or debit card</p>
                ) : (
                  <p className="flex items-center gap-2 font-medium"><Landmark className="size-4" /> Manual payment (bank transfer or cash on delivery)</p>
                )}
                <p className="mt-1 text-neutral-500">
                  {cardPayments
                    ? "After you click “Pay now”, you’ll be redirected to Stripe to complete your purchase securely."
                    : "The store will contact you with payment details after you place your order."}
                </p>
              </div>
            </section>

            <section className="mt-8">
              <label className="text-sm font-medium" htmlFor="note">Order note (optional)</label>
              <textarea id="note" rows={2} value={f.note} onChange={set("note")} className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[var(--store-accent)]" />
            </section>

            {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !ready}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-lg text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--store-accent)" }}
            >
              {submitting && <Loader2 className="size-5 animate-spin" />}
              {cardPayments ? "Pay now" : "Complete order"}
            </button>
            <p className="mt-6 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
              By placing your order you agree to the store’s terms. Your details are shared only with {store.store_name}.
            </p>
          </form>
        </div>
        <aside className="hidden border-l border-neutral-200 bg-neutral-50 lg:block">
          <div className="sticky top-0 max-w-[460px] px-10 py-8">{summary}</div>
        </aside>
      </div>
    </>
  )
}
