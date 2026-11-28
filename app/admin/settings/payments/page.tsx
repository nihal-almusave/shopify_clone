import { requireMerchant } from "@/lib/auth"
import type { PaymentMethodId } from "@/lib/payments/methods"
import { PaymentsForm } from "@/components/admin/payments-form"

export const metadata = { title: "Payments" }
export const dynamic = "force-dynamic"

export default async function PaymentsPage() {
  const { supabase, merchant } = await requireMerchant()
  const { data } = await supabase.from("merchant_payment_methods").select("method, enabled, details").eq("merchant_id", merchant.id)
  return (
    <PaymentsForm
      merchantId={merchant.id}
      configured={(data ?? []) as { method: PaymentMethodId; enabled: boolean; details: Record<string, string> }[]}
    />
  )
}
