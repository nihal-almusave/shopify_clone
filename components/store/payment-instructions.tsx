import { Banknote, Landmark, Smartphone } from "lucide-react"
import { formatMoney } from "@/lib/format"

/** How to pay for an order placed with an offline method (cash, mobile wallet, bank transfer). */
export function PaymentInstructions({
  method,
  details,
  total,
  currency,
  orderNumber,
}: {
  method: string
  details: Record<string, string>
  total: number
  currency: string
  orderNumber: number
}) {
  const amount = formatMoney(total, currency)
  const ref = `#${orderNumber}`
  const Row = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="flex justify-between gap-4 py-1.5">
        <dt className="text-neutral-500">{label}</dt>
        <dd className="text-right font-medium">{value}</dd>
      </div>
    ) : null

  if (method === "mobile_wallet")
    return (
      <div className="mt-5 rounded-lg bg-neutral-50 p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold"><Smartphone className="size-4" /> Pay with {details.provider || "mobile wallet"}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-neutral-600">
          <li>Open {details.provider || "your wallet app"} and choose <strong>Send Money</strong>.</li>
          <li>Send <strong>{amount}</strong> to <strong>{details.account_number}</strong>{details.account_type ? ` (${details.account_type})` : ""}.</li>
          <li>Use <strong>{ref}</strong> as the reference.</li>
        </ol>
        {details.instructions && <p className="mt-2 text-neutral-600">{details.instructions}</p>}
        <p className="mt-2 text-xs text-neutral-500">The store confirms your payment and updates this page.</p>
      </div>
    )
  if (method === "bank_transfer")
    return (
      <div className="mt-5 rounded-lg bg-neutral-50 p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold"><Landmark className="size-4" /> Pay by bank transfer</p>
        <dl className="mt-2 divide-y divide-neutral-200">
          <Row label="Amount" value={amount} />
          <Row label="Bank" value={details.bank_name} />
          <Row label="Account name" value={details.account_name} />
          <Row label="Account number" value={details.account_number} />
          <Row label="Branch / routing" value={details.branch} />
          <Row label="Reference" value={ref} />
        </dl>
        {details.instructions && <p className="mt-2 text-neutral-600">{details.instructions}</p>}
      </div>
    )
  if (method === "cod" || method === "manual")
    return (
      <div className="mt-5 rounded-lg bg-neutral-50 p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold"><Banknote className="size-4" /> Cash on delivery</p>
        <p className="mt-1 text-neutral-600">Pay <strong>{amount}</strong> in cash when your order arrives.{details.instructions ? ` ${details.instructions}` : ""}</p>
      </div>
    )
  return null
}
