/**
 * Payment methods a store can offer. Offline methods work today; gateways are listed with the
 * integration status so they can be switched on as each provider is connected (see providers.ts).
 * Money always goes to the merchant's own account.
 */
export type PaymentMethodId = "cod" | "bank_transfer" | "mobile_wallet" | "stripe" | "sslcommerz" | "bkash"

export type MethodField = { key: string; label: string; placeholder?: string; multiline?: boolean; required?: boolean }

export type MethodInfo = {
  id: PaymentMethodId
  name: string
  summary: string
  kind: "offline" | "gateway"
  status: "available" | "coming_soon"
  region: string
  fields: MethodField[]
}

export const PAYMENT_METHODS: MethodInfo[] = [
  {
    id: "cod",
    name: "Cash on delivery",
    summary: "Customers pay in cash when their order arrives.",
    kind: "offline",
    status: "available",
    region: "Everywhere",
    fields: [{ key: "instructions", label: "Note for customers (optional)", placeholder: "Please keep exact change ready.", multiline: true }],
  },
  {
    id: "mobile_wallet",
    name: "bKash / Nagad / Rocket (Send Money)",
    summary: "Customers send money to your wallet number and add the order number as reference.",
    kind: "offline",
    status: "available",
    region: "Bangladesh",
    fields: [
      { key: "provider", label: "Wallet", placeholder: "bKash", required: true },
      { key: "account_number", label: "Wallet number", placeholder: "01XXXXXXXXX", required: true },
      { key: "account_type", label: "Account type", placeholder: "Personal / Merchant" },
      { key: "instructions", label: "Instructions (optional)", placeholder: "Use your order number as the reference.", multiline: true },
    ],
  },
  {
    id: "bank_transfer",
    name: "Bank transfer",
    summary: "Customers transfer to your bank account; you mark the order paid when it arrives.",
    kind: "offline",
    status: "available",
    region: "Everywhere",
    fields: [
      { key: "bank_name", label: "Bank", required: true },
      { key: "account_name", label: "Account name", required: true },
      { key: "account_number", label: "Account number", required: true },
      { key: "branch", label: "Branch / routing number" },
      { key: "instructions", label: "Instructions (optional)", multiline: true },
    ],
  },
  {
    id: "sslcommerz",
    name: "SSLCommerz",
    summary: "Cards, bKash, Nagad, Rocket and internet banking in one Bangladeshi gateway.",
    kind: "gateway",
    status: "coming_soon",
    region: "Bangladesh",
    fields: [],
  },
  {
    id: "bkash",
    name: "bKash Payment Gateway",
    summary: "Customers approve the payment in the bKash app; it’s confirmed automatically.",
    kind: "gateway",
    status: "coming_soon",
    region: "Bangladesh",
    fields: [],
  },
  {
    id: "stripe",
    name: "Stripe",
    summary: "International cards, Apple Pay and Google Pay, paid out to your own Stripe account.",
    kind: "gateway",
    status: "coming_soon",
    region: "Outside Bangladesh",
    fields: [],
  },
]

export const OFFLINE_METHODS = PAYMENT_METHODS.filter((m) => m.kind === "offline")

export function methodName(id: string) {
  if (id === "manual") return "Manual payment"
  return PAYMENT_METHODS.find((m) => m.id === id)?.name ?? id
}

export type EnabledMethod = { method: PaymentMethodId; details: Record<string, string> }
