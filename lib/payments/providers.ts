import "server-only"

/**
 * Online payment gateway integrations. Each store connects its OWN gateway account, so money goes
 * straight to the merchant. To add a gateway:
 *   1. Implement PaymentGateway below (create a hosted checkout, then verify the result server-side).
 *   2. Store the merchant's credentials in a server-only table (service role; never readable by browsers).
 *   3. Add a callback route under /api/payments/<gateway>/ that verifies the payment and marks the
 *      order paid with the mark_order_paid() database function.
 *   4. Flip its status to "available" in lib/payments/methods.ts.
 *
 * Gateway notes:
 *   - SSLCommerz: sandbox store id/password from developer.sslcommerz.com; "Initiate Payment" API returns
 *     a GatewayPageURL; confirm with the IPN + "Validation API" (val_id).
 *   - bKash Tokenized Checkout: app key/secret, username/password from bKash; grant token → create
 *     payment → redirect to bkashURL → execute payment on callback.
 *   - Stripe: use Stripe Connect (Standard accounts) so each merchant has their own Stripe account;
 *     create Checkout Sessions on the connected account. The current platform-level Stripe in
 *     lib/checkout.ts is the starting point.
 */
import type { PaymentMethodId } from "@/lib/payments/methods"

export type GatewayOrder = {
  id: string
  orderNumber: number
  storeSlug: string
  currency: string
  total: number
  email: string
  customerName: string | null
  items: { name: string; price: number; quantity: number }[]
}

export interface PaymentGateway {
  id: Exclude<PaymentMethodId, "cod" | "bank_transfer" | "mobile_wallet">
  /** Start a payment and return where to send the customer. */
  createCheckout(order: GatewayOrder, urls: { success: string; cancel: string; callback: string }): Promise<{ redirectUrl: string }>
  /** Confirm a payment server-side from the gateway's callback/IPN. Returns true when paid. */
  confirm(orderId: string, payload: Record<string, string>): Promise<boolean>
}

/** Registered gateways. Empty until a gateway integration is built and enabled. */
export const GATEWAYS: Partial<Record<PaymentGateway["id"], PaymentGateway>> = {}
