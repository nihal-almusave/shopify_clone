import Link from "next/link"
import { ArrowRight, BarChart3, CreditCard, Globe, Package, Palette, Truck } from "lucide-react"
import { Logo } from "@/components/logo"

const FEATURES = [
  { icon: Globe, title: "Your own storefront", body: "A fast, mobile-first store at your own URL with product pages, cart and checkout built in." },
  { icon: Package, title: "Products & inventory", body: "Add products with photos, compare-at prices and costs. Stock updates automatically with every order." },
  { icon: CreditCard, title: "Get paid", body: "Accept cards with Stripe, or take bank transfers and cash on delivery from day one." },
  { icon: Truck, title: "Order management", body: "Every order lands in one inbox. Mark as paid, fulfill with tracking, cancel and restock." },
  { icon: BarChart3, title: "Analytics", body: "Track sales, orders and average order value at a glance from your admin home." },
  { icon: Palette, title: "Make it yours", body: "Upload your logo and cover image, pick an accent color, and announce promotions." },
]

export default function LandingPage() {
  return (
    <main className="bg-[#fbfaf7] text-[#10231b]">
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Logo className="size-9" />
            <span className="font-display text-2xl font-bold tracking-tight">shophub</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="rounded-full px-4 py-2 text-sm font-semibold text-white/90 hover:text-white">
              Log in
            </Link>
            <Link href="/auth/signup" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0b3d2c] hover:bg-[#e8fff3]">
              Start for free
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative isolate overflow-hidden bg-[#0b3d2c] pt-36 pb-0 text-white">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(70rem 40rem at 15% -20%, rgba(54,251,161,.55) 0%, transparent 60%), radial-gradient(50rem 30rem at 100% 30%, rgba(14,122,85,.9) 0%, transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="mx-auto mb-6 w-fit rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-[#b6ffd8]">
            Everything you need to sell online
          </p>
          <h1 className="mx-auto max-w-4xl font-display text-5xl leading-[0.95] font-bold tracking-tight sm:text-7xl">
            Turn your idea into a store that sells.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/75">
            Launch a beautiful online store in minutes. Add products, take orders and get paid, all from one simple admin.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/auth/signup" className="inline-flex h-13 items-center gap-2 rounded-full bg-[#36fba1] px-7 py-4 text-base font-semibold text-[#0b3d2c] transition-transform hover:-translate-y-0.5">
              Start your store <ArrowRight className="size-4" />
            </Link>
            <Link href="/store/demo" className="inline-flex items-center rounded-full border border-white/25 px-7 py-4 text-base font-semibold text-white hover:bg-white/10">
              See a demo store
            </Link>
          </div>
        </div>

        {/* Product preview */}
        <div className="mx-auto mt-16 max-w-5xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-t-2xl border border-b-0 border-white/15 bg-[#f1f1f1] text-[#303030] shadow-[0_-20px_80px_rgba(0,0,0,.35)]">
            <div className="flex h-10 items-center gap-2 bg-[#1a1a1a] px-4">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <span className="mx-auto hidden h-6 w-72 rounded-md bg-[#303030] sm:block" />
            </div>
            <div className="grid grid-cols-[150px_1fr] text-left text-[12px] sm:grid-cols-[190px_1fr]">
              <div className="space-y-1 bg-[#ebebeb] p-3 font-semibold">
                {["Home", "Orders", "Products", "Customers", "Online Store"].map((n, i) => (
                  <div key={n} className={`rounded-md px-2 py-1.5 ${i === 0 ? "bg-white" : ""}`}>{n}</div>
                ))}
              </div>
              <div className="grid gap-3 p-4">
                <div className="grid grid-cols-3 gap-3">
                  {[["Total sales", "$12,480.20"], ["Orders", "318"], ["Avg. order", "$39.25"]].map(([k, v]) => (
                    <div key={k} className="surface p-3">
                      <p className="text-[11px] text-[#616161]">{k}</p>
                      <p className="mt-1 text-base font-bold sm:text-lg">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="surface p-3">
                  <svg viewBox="0 0 400 90" className="h-24 w-full" preserveAspectRatio="none" aria-hidden>
                    <defs>
                      <linearGradient id="lp" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor="#005bd3" stopOpacity=".25" />
                        <stop offset="1" stopColor="#005bd3" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0 70 C40 60 60 72 90 55 S150 40 180 46 240 20 270 30 330 12 400 8 V90 H0Z" fill="url(#lp)" />
                    <path d="M0 70 C40 60 60 72 90 55 S150 40 180 46 240 20 270 30 330 12 400 8" fill="none" stroke="#005bd3" strokeWidth="2" />
                  </svg>
                </div>
                <div className="surface divide-y divide-[#ebebeb]">
                  {[["#1024", "Maya Chen", "$84.00"], ["#1023", "Jordan Lee", "$129.50"]].map(([n, c, t]) => (
                    <div key={n} className="flex items-center gap-3 px-3 py-2">
                      <span className="w-12 font-semibold">{n}</span>
                      <span className="flex-1">{c}</span>
                      <span className="hidden rounded-full bg-[#ffef9d] px-2 py-0.5 text-[11px] sm:inline">Unfulfilled</span>
                      <span className="font-medium">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <h2 className="max-w-2xl font-display text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
          One platform for your whole business.
        </h2>
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="mb-4 grid size-11 place-items-center rounded-xl bg-[#0b3d2c] text-[#36fba1]">
                <f.icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-[#4b5a53]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e7e3d8] bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-3">
          {[
            ["01", "Create your store", "Pick a name and URL. Your storefront is live instantly."],
            ["02", "Add your products", "Upload photos, set prices and stock, publish when ready."],
            ["03", "Start selling", "Share your link. Orders and customers flow into your admin."],
          ].map(([n, t, b]) => (
            <div key={n}>
              <p className="font-display text-5xl font-bold text-[#36fba1] [-webkit-text-stroke:1.5px_#0b3d2c]">{n}</p>
              <h3 className="mt-3 text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-[#4b5a53]">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#0b3d2c] px-8 py-16 text-center text-white sm:px-16">
          <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(40rem 20rem at 50% 120%, rgba(54,251,161,.45), transparent 70%)" }} />
          <h2 className="relative font-display text-4xl font-bold tracking-tight sm:text-5xl">Your store is a few clicks away.</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-white/75">Free to start. Bring your products and we’ll handle the rest.</p>
          <Link href="/auth/signup" className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[#36fba1] px-7 py-4 font-semibold text-[#0b3d2c]">
            Start for free <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e7e3d8]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-[#4b5a53] sm:px-6">
          <span className="flex items-center gap-2">
            <Logo className="size-6" /> © {new Date().getFullYear()} ShopHub
          </span>
          <div className="flex gap-6">
            <Link href="/auth/login" className="hover:text-[#10231b]">Log in</Link>
            <Link href="/auth/signup" className="hover:text-[#10231b]">Create a store</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
