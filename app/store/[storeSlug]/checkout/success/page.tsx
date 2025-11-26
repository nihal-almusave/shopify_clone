import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function CheckoutSuccessPage({
  params,
}: {
  params: { storeSlug: string }
}) {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="text-6xl mb-4 text-green-500">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. You will receive a confirmation email shortly. You can track your order status
            on the orders page.
          </p>
          <div className="space-y-2">
            <Link href="/orders">
              <Button className="w-full">View Your Orders</Button>
            </Link>
            <Link href={`/store/${params.storeSlug}`}>
              <Button variant="outline" className="w-full bg-transparent">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
