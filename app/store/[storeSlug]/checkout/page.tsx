import { createClient } from "@/lib/supabase/server"
import type { EnabledMethod } from "@/lib/payments/methods"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefront, stripeEnabled } from "@/lib/storefront"
import { CheckoutForm } from "@/components/store/checkout-form"

export const metadata: Metadata = { title: "Checkout", robots: { index: false } }

export default async function CheckoutPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params
  const store = await getStorefront(storeSlug)
  if (!store) notFound()
  const supabase = await createClient()
  const { data: methods } = await supabase
    .from("merchant_payment_methods")
    .select("method, details")
    .eq("merchant_id", store.id)
    .eq("enabled", true)
    .in("method", ["cod", "mobile_wallet", "bank_transfer"])
  return <CheckoutForm store={store} cardPayments={stripeEnabled()} methods={(methods ?? []) as EnabledMethod[]} />
}
