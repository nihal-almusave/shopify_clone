import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefront, stripeEnabled } from "@/lib/storefront"
import { CheckoutForm } from "@/components/store/checkout-form"

export const metadata: Metadata = { title: "Checkout", robots: { index: false } }

export default async function CheckoutPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params
  const store = await getStorefront(storeSlug)
  if (!store) notFound()
  return <CheckoutForm store={store} cardPayments={stripeEnabled()} />
}
