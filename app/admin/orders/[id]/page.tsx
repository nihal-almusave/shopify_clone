import Link from "next/link"
import { notFound } from "next/navigation"
import { Mail, Phone } from "lucide-react"
import { requireMerchant } from "@/lib/auth"
import { formatDateTime, formatMoney } from "@/lib/format"
import type { Order, OrderItem } from "@/lib/types"
import { Badge, Card, Page, Thumbnail, fulfillmentBadge, paymentBadge } from "@/components/admin/ui"
import { OrderActions, OrderNote } from "@/components/admin/order-actions"

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, merchant } = await requireMerchant()
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("merchant_id", merchant.id)
    .maybeSingle()
  if (!data) notFound()
  const order = data as Order & { order_items: OrderItem[] }
  const money = (v: number) => formatMoney(v, order.currency)
  const itemCount = order.order_items.reduce((s, i) => s + i.quantity, 0)
  const a = order.shipping_address
  const cancelled = order.status === "cancelled"

  return (
    <Page
      narrow
      backHref="/admin/orders"
      title={`#${order.order_number}`}
      badges={
        <>
          {cancelled && <Badge tone="neutral">Cancelled</Badge>}
          {order.status === "archived" && <Badge tone="neutral">Archived</Badge>}
          {paymentBadge(order.payment_status)}
          {fulfillmentBadge(order.fulfillment_status)}
        </>
      }
      subtitle={`${formatDateTime(order.created_at)} from Online Store`}
      actions={<OrderActions order={order} />}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="grid content-start gap-4">
          <Card
            title={
              <span className="flex items-center gap-2">
                {fulfillmentBadge(order.fulfillment_status)}
                <span className="text-[#616161]">({itemCount})</span>
              </span>
            }
          >
            <ul className="divide-y divide-[#ebebeb] rounded-lg border border-[#ebebeb]">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 p-3 text-[13px]">
                  <Thumbnail src={item.product_image} alt={item.product_name} />
                  <div className="min-w-0 flex-1">
                    {item.product_id ? (
                      <Link href={`/admin/products/${item.product_id}`} className="font-semibold text-[#005bd3] hover:underline">
                        {item.product_name}
                      </Link>
                    ) : (
                      <span className="font-semibold">{item.product_name}</span>
                    )}
                    {item.sku && <p className="text-xs text-[#616161]">SKU: {item.sku}</p>}
                  </div>
                  <span className="text-[#616161]">
                    {money(item.price)} × {item.quantity}
                  </span>
                  <span className="w-20 text-right">{money(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            {order.tracking_number && (
              <p className="mt-3 text-[13px] text-[#616161]">
                Tracking number: <span className="font-medium text-[#303030]">{order.tracking_number}</span>
              </p>
            )}
          </Card>

          <Card title={<span className="flex items-center gap-2">{paymentBadge(order.payment_status)}</span>}>
            <dl className="grid grid-cols-[1fr_auto] gap-y-2 rounded-lg border border-[#ebebeb] p-3 text-[13px]">
              <dt>Subtotal</dt>
              <dd className="text-right">{money(order.subtotal)}</dd>
              <dt>Shipping</dt>
              <dd className="text-right">{money(order.shipping_cost)}</dd>
              <dt>Taxes</dt>
              <dd className="text-right">{money(order.tax)}</dd>
              <dt className="font-semibold">Total</dt>
              <dd className="text-right font-semibold">{money(order.total_price)}</dd>
              <dt className="border-t border-[#ebebeb] pt-2">{order.payment_status === "paid" ? "Paid" : "Balance due"}</dt>
              <dd className="border-t border-[#ebebeb] pt-2 text-right">{money(order.total_price)}</dd>
            </dl>
            <p className="mt-2 text-xs text-[#616161]">
              Payment method: {order.payment_method === "stripe" ? "Card (Stripe)" : "Manual payment"}
              {order.paid_at && ` · Paid ${formatDateTime(order.paid_at)}`}
            </p>
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <OrderNote orderId={order.id} note={order.note} />
          <Card title="Customer">
            <p className="text-[13px] font-medium text-[#005bd3]">{order.customer_name || "Guest"}</p>
            <h3 className="mt-4 mb-1 text-[13px] font-semibold">Contact information</h3>
            <p className="flex items-center gap-1.5 text-[13px] text-[#005bd3]">
              <Mail className="size-3.5" />
              <a href={`mailto:${order.email}`} className="hover:underline">{order.email}</a>
            </p>
            {order.phone && (
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#616161]">
                <Phone className="size-3.5" /> {order.phone}
              </p>
            )}
            <h3 className="mt-4 mb-1 text-[13px] font-semibold">Shipping address</h3>
            {a ? (
              <address className="text-[13px] leading-5 text-[#616161] not-italic">
                {[a.first_name, a.last_name].filter(Boolean).join(" ")}
                <br />
                {a.address1}
                {a.address2 && (
                  <>
                    <br />
                    {a.address2}
                  </>
                )}
                <br />
                {[a.city, a.province, a.postal_code].filter(Boolean).join(" ")}
                <br />
                {a.country}
              </address>
            ) : (
              <p className="text-[13px] text-[#616161]">No shipping address</p>
            )}
          </Card>
        </div>
      </div>
    </Page>
  )
}
