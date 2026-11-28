import { PaymentInstructions } from "@/components/store/payment-instructions"
import { methodName } from "@/lib/payments/methods"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2, Circle, Package } from "lucide-react"
import { getStorefront, stripeEnabled } from "@/lib/storefront"
import { createClient } from "@/lib/supabase/server"
import { confirmStripeSession } from "@/lib/payments"
import { formatDate, formatMoney } from "@/lib/format"
import type { PublicOrder } from "@/lib/types"
import { CheckoutHeader } from "@/components/store/checkout-header"
import { PayNowButton } from "@/components/store/pay-now-button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Order status", robots: { index: false } }
export const dynamic = "force-dynamic"

export default async function OrderStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string; orderId: string }>
  searchParams: Promise<{ session_id?: string; payment?: string; new?: string }>
}) {
  const { storeSlug, orderId } = await params
  const { session_id, payment } = await searchParams
  const store = await getStorefront(storeSlug)
  if (!store || !/^[0-9a-f-]{36}$/i.test(orderId)) notFound()

  if (session_id) await confirmStripeSession(orderId, session_id)

  const supabase = await createClient()
  const { data } = await supabase.rpc("get_order_public", { p_order_id: orderId })
  const order = data as PublicOrder | null
  if (!order || order.store_slug !== storeSlug) notFound()

  const money = (v: number) => formatMoney(v, order.currency)
  const { data: pm } = await supabase
    .from("merchant_payment_methods")
    .select("details")
    .eq("merchant_id", store.id)
    .eq("method", order.payment_method)
    .maybeSingle()
  const payDetails = (pm?.details ?? {}) as Record<string, string>
  const paid = order.payment_status === "paid"
  const cancelled = order.status === "cancelled"
  const firstName = order.customer_name?.split(" ")[0]
  const a = order.shipping_address

  const steps = [
    { label: "Confirmed", done: true },
    { label: paid ? "Paid" : "Awaiting payment", done: paid },
    { label: "Shipped", done: order.fulfillment_status === "fulfilled" },
  ]

  return (
    <>
      <CheckoutHeader store={store} />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div className="grid content-start gap-5">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-full border-2" style={{ borderColor: "var(--store-accent)", color: "var(--store-accent)" }}>
              {cancelled ? <Circle className="size-6" /> : <CheckCircle2 className="size-7" />}
            </div>
            <div>
              <p className="text-sm text-neutral-500">Order #{order.order_number}</p>
              <h1 className="text-2xl font-semibold">
                {cancelled ? "Your order was cancelled" : `Thank you${firstName ? `, ${firstName}` : ""}!`}
              </h1>
            </div>
          </div>

          {payment === "cancelled" && !paid && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Payment wasn’t completed. Your order is saved. You can pay below whenever you’re ready.
            </p>
          )}
          {payment === "error" && !paid && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              We couldn’t start the card payment. Please try again below.
            </p>
          )}

          <section className="rounded-xl border border-neutral-200 p-5">
            <h2 className="font-semibold">{cancelled ? "Order cancelled" : paid ? "Your order is confirmed" : "Your order is placed"}</h2>
            <p className="mt-1 text-sm text-neutral-600">
              {cancelled
                ? "Contact the store if you have any questions."
                : paid
                  ? `We’ve received your payment. ${store.store_name} will send updates to ${order.email}.`
                  : order.payment_method === "stripe"
                    ? "Complete your card payment to confirm the order."
                    : order.payment_method === "cod" || order.payment_method === "manual"
                      ? `${store.store_name} will send updates to ${order.email}.`
                      : "Follow the payment steps below to confirm your order."}
            </p>
            {!cancelled && (
              <ol className="mt-5 grid grid-cols-3 gap-2">
                {steps.map((s) => (
                  <li key={s.label} className="text-center">
                    <div className={cn("mx-auto mb-2 h-1.5 rounded-full", s.done ? "" : "bg-neutral-200")} style={s.done ? { background: "var(--store-accent)" } : undefined} />
                    <span className={cn("text-xs", s.done ? "font-semibold" : "text-neutral-500")}>{s.label}</span>
                  </li>
                ))}
              </ol>
            )}
            {order.tracking_number && (
              <p className="mt-4 flex items-center gap-2 text-sm">
                <Package className="size-4" /> Tracking number: <strong>{order.tracking_number}</strong>
              </p>
            )}
            {!paid && !cancelled && order.payment_method === "stripe" && stripeEnabled() && <PayNowButton orderId={order.id} />}
            {!paid && !cancelled && order.payment_method !== "stripe" && (
              <PaymentInstructions method={order.payment_method} details={payDetails} total={Number(order.total_price)} currency={order.currency} orderNumber={order.order_number} />
            )}
          </section>

          <section className="grid gap-6 rounded-xl border border-neutral-200 p-5 text-sm sm:grid-cols-2">
            <div>
              <h3 className="mb-1 font-semibold">Contact information</h3>
              <p className="text-neutral-600">{order.email}</p>
              <h3 className="mt-4 mb-1 font-semibold">Payment method</h3>
              <p className="text-neutral-600">{methodName(order.payment_method)} · {money(order.total_price)}</p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Shipping address</h3>
              {a && (
                <address className="leading-6 text-neutral-600 not-italic">
                  {[a.first_name, a.last_name].filter(Boolean).join(" ")}
                  <br />
                  {a.address1}
                  {a.address2 ? `, ${a.address2}` : ""}
                  <br />
                  {[a.city, a.province, a.postal_code].filter(Boolean).join(" ")}
                  <br />
                  {a.country}
                </address>
              )}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">Placed {formatDate(order.created_at)}. Bookmark this page to check your order status.</p>
            <Link href={`/store/${storeSlug}`} className="inline-flex h-11 items-center rounded-lg px-6 text-sm font-semibold text-white" style={{ background: "var(--store-accent)" }}>
              Continue shopping
            </Link>
          </div>
        </div>

        <aside className="h-fit rounded-xl bg-neutral-50 p-6">
          <ul className="grid gap-4">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 rounded-lg border border-neutral-200 bg-white">
                  {i.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.image} alt="" className="size-full rounded-lg object-cover" />
                  )}
                  <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-neutral-600 text-[11px] font-semibold text-white">{i.quantity}</span>
                </div>
                <p className="flex-1 text-sm font-medium">{i.name}</p>
                <p className="text-sm">{money(i.price * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 grid grid-cols-[1fr_auto] gap-y-2 text-sm">
            <dt>Subtotal</dt>
            <dd className="text-right">{money(order.subtotal)}</dd>
            <dt>Shipping</dt>
            <dd className="text-right">{Number(order.shipping_cost) === 0 ? "Free" : money(order.shipping_cost)}</dd>
            {Number(order.tax) > 0 && (
              <>
                <dt>Taxes</dt>
                <dd className="text-right">{money(order.tax)}</dd>
              </>
            )}
            <dt className="pt-2 text-lg font-semibold">Total</dt>
            <dd className="pt-2 text-right text-lg font-semibold">{money(order.total_price)}</dd>
          </dl>
        </aside>
      </div>
    </>
  )
}
