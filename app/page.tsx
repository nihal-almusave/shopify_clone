import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-bold text-white">ShopHub</div>
          <div className="flex items-center gap-4">
            <Link href="/merchant/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/merchant/auth/signup">
              <Button>Start Selling</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="px-6 py-24 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-white mb-6">Build Your Online Store, Your Way</h1>
        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
          ShopHub is the all-in-one platform for selling online. Manage products, process payments, and track orders—all
          in one place.
        </p>
        <Link href="/merchant/auth/signup">
          <Button size="lg" className="text-lg">
            Start Free Trial
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Everything You Need to Sell</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Easy Setup", desc: "Launch your store in minutes" },
            { title: "Smart Inventory", desc: "Real-time stock management" },
            { title: "Secure Payments", desc: "Stripe integration built-in" },
            { title: "Analytics", desc: "Track sales and customer data" },
            { title: "Customer Reviews", desc: "Build trust with ratings" },
            { title: "Order Fulfillment", desc: "Streamlined operations" },
          ].map((feature) => (
            <div key={feature.title} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
