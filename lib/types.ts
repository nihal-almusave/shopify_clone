export type Merchant = {
  id: string
  store_name: string
  store_slug: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  favicon_url: string | null
  announcement: string | null
  accent_color: string
  email: string
  phone: string | null
  currency: string
  tax_rate: number
  shipping_rate: number
  free_shipping_threshold: number | null
  created_at: string
}

export type Storefront = Pick<
  Merchant,
  | "id"
  | "store_name"
  | "store_slug"
  | "description"
  | "logo_url"
  | "banner_url"
  | "favicon_url"
  | "announcement"
  | "accent_color"
  | "currency"
  | "tax_rate"
  | "shipping_rate"
  | "free_shipping_threshold"
>

export const STOREFRONT_COLUMNS =
  "id, store_name, store_slug, description, logo_url, banner_url, favicon_url, announcement, accent_color, currency, tax_rate, shipping_rate, free_shipping_threshold"

export type ProductStatus = "active" | "draft" | "archived"

export type Product = {
  id: string
  merchant_id: string
  name: string
  description: string | null
  sku: string | null
  price: number
  compare_at_price: number | null
  cost: number | null
  quantity: number
  track_inventory: boolean
  category: string | null
  vendor: string | null
  images: string[]
  status: ProductStatus
  created_at: string
  updated_at: string
}

export type ShippingAddress = {
  first_name?: string
  last_name?: string
  address1?: string
  address2?: string
  city?: string
  province?: string
  postal_code?: string
  country?: string
}

export type Order = {
  id: string
  merchant_id: string
  customer_id: string | null
  order_number: number
  email: string
  customer_name: string | null
  phone: string | null
  status: "open" | "archived" | "cancelled"
  payment_status: "pending" | "paid" | "refunded"
  fulfillment_status: "unfulfilled" | "fulfilled"
  payment_method: "manual" | "stripe"
  subtotal: number
  shipping_cost: number
  tax: number
  total_price: number
  currency: string
  shipping_address: ShippingAddress | null
  note: string | null
  tracking_number: string | null
  paid_at: string | null
  fulfilled_at: string | null
  cancelled_at: string | null
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  sku: string | null
  quantity: number
  price: number
}

export type Customer = {
  id: string
  merchant_id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  accepts_marketing: boolean
  orders_count: number
  total_spent: number
  created_at: string
}

export type PublicOrder = {
  id: string
  order_number: number
  email: string
  customer_name: string | null
  payment_status: Order["payment_status"]
  fulfillment_status: Order["fulfillment_status"]
  payment_method: Order["payment_method"]
  status: Order["status"]
  subtotal: number
  shipping_cost: number
  tax: number
  total_price: number
  currency: string
  shipping_address: ShippingAddress | null
  tracking_number: string | null
  created_at: string
  store_slug: string
  store_name: string
  items: { id: string; name: string; image: string | null; quantity: number; price: number }[]
}
