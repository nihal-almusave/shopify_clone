import Link from "next/link"
import { Banknote, Check, ChevronDown, Landmark, LayoutGrid, Package, Palette, ShoppingBag, Smartphone, Truck, Users } from "lucide-react"
import { Logo } from "@/components/logo"
import { SiteNav } from "@/components/marketing/site-nav"
import { JsonLd } from "@/components/json-ld"
import { ThemeSwatch } from "@/components/admin/theme-swatch"
import { publicSupabase } from "@/lib/public-supabase"
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site"
import type { ThemeTokens } from "@/lib/themes"

export const revalidate = 3600
export const metadata = { alternates: { canonical: "/" } }

const FEATURES = [
  { icon: ShoppingBag, title: "Your own online store", body: "A fast, mobile-friendly shop at your own link, with product pages, cart and checkout." },
  { icon: Package, title: "Products and stock", body: "Photos, prices, sale prices and stock counts that go down by themselves with every order." },
  { icon: Truck, title: "Orders in one place", body: "See every order, mark it paid, ship it with a tracking number, or cancel and restock." },
  { icon: Users, title: "Customer list", body: "Everyone who orders is saved with their order history and total spent." },
  { icon: Palette, title: "Themes and branding", body: "Pick a theme, add your logo, cover photo and colors. Preview before you publish." },
  { icon: LayoutGrid, title: "Sales at a glance", body: "Daily sales, orders and average order value, plus alerts when stock runs low." },
]

const FAQ = [
  { q: "Is ShopHub free?", a: "Yes. Creating a store, adding products and taking orders is free. You don’t need a credit card to start." },
  { q: "How do my customers pay?", a: "Today: cash on delivery, bKash/Nagad/Rocket Send Money to your number, or bank transfer. You choose which ones to offer. Online gateways (SSLCommerz, bKash Payment Gateway, Stripe) are coming, and payments will go straight to your own account." },
  { q: "Do I need a website or a developer?", a: "No. Your store is ready the moment you sign up, at its own link you can share on Facebook, Instagram or WhatsApp." },
  { q: "Can I change how my store looks?", a: "Yes. Choose from ready-made themes or upload your own theme file, preview it on your store, then publish. Your logo, colors and cover photo work with every theme." },
  { q: "Can I sell in Taka?", a: "Yes. Set your store currency to BDT (or USD, EUR, GBP, INR and more), plus your tax rate and delivery charge." },
]

const H2 = "font-display text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[1] font-bold tracking-[-0.04em]"

export default async function LandingPage() {
  let themes: { id: string; name: string; tokens: ThemeTokens }[] = []
  try {
    const { data } = await publicSupabase().from("themes").select("id, name, tokens").eq("is_published", true).is("owner_id", null).order("created_at").limit(4)
    themes = (data ?? []) as typeof themes
  } catch {
    // The page renders without the theme gallery if the database is unreachable.
  }

  return (
    <div className="bg-[#fbfbf8] text-[#12201a]">
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "Organization", name: "ShopHub", url: SITE_URL, logo: `${SITE_URL}/api/icon?size=512` },
          { "@context": "https://schema.org", "@type": "WebSite", name: "ShopHub", url: SITE_URL },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ShopHub",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: SITE_DESCRIPTION,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />
      <SiteNav alwaysSolid />

      <main>
        {/* Hero */}
        <section className="overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
          <div className="mx-auto grid max-w-[84rem] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div>
              <h1 className="font-display text-[clamp(2.75rem,6.4vw,5.5rem)] leading-[0.95] font-bold tracking-[-0.045em]">Open your online shop today.</h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#4d5b53]">
                ShopHub gives your business a store, a checkout and an admin to run it. Take orders with cash on delivery, bKash or bank transfer from day one.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/auth/signup" className="inline-flex h-12 items-center rounded-full bg-[#0b3d2c] px-7 text-[15px] font-semibold text-white transition-colors hover:bg-[#12523c]">
                  Create your free store
                </Link>
                <Link href="/store/demo" className="inline-flex h-12 items-center rounded-full px-7 text-[15px] font-semibold ring-1 ring-[#c9cfc7] ring-inset hover:bg-white">
                  See a live demo store
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#4d5b53]">
                {["Free to start", "No credit card", "Works on any phone"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="size-4 text-[#0b6e4f]" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <figure className="relative">
              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-30px_rgba(18,32,26,.45)] ring-1 ring-[#e3e6df]">
                <div className="flex items-center gap-1.5 border-b border-[#eceee9] bg-[#f7f8f5] px-3 py-2">
                  <span className="size-2.5 rounded-full bg-[#d9ddd6]" />
                  <span className="size-2.5 rounded-full bg-[#d9ddd6]" />
                  <span className="size-2.5 rounded-full bg-[#d9ddd6]" />
                  <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 text-[11px] text-[#5d6b63]">shophub-business.vercel.app/store/demo</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/landing/storefront-desktop.jpg" alt="The ShopHub demo store, Northwind Goods, in a desktop browser" width={1920} height={1200} className="block w-full" fetchPriority="high" />
              </div>
              <div className="absolute -right-3 -bottom-10 w-[30%] min-w-[120px] overflow-hidden rounded-[1.6rem] border-[5px] border-[#12201a] bg-white shadow-2xl sm:-right-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/landing/product-phone.jpg" alt="A product page from the demo store on a phone" width={780} height={1560} className="block w-full" />
              </div>
              <figcaption className="mt-14 text-xs text-[#8a958e]">Real screenshots of the ShopHub demo store</figcaption>
            </figure>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-16 border-t border-[#e6e8e2] bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-[84rem] px-5 sm:px-8">
            <h2 className={`max-w-2xl ${H2}`}>Everything a small shop needs, nothing it doesn’t.</h2>
            <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="border-t border-[#e6e8e2] pt-6">
                  <f.icon className="size-6 text-[#0b3d2c]" />
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 leading-relaxed text-[#4d5b53]">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payments */}
        <section id="payments" className="scroll-mt-16 py-20 sm:py-28">
          <div className="mx-auto grid max-w-[84rem] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div>
              <h2 className={H2}>Get paid the way your customers already pay.</h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#4d5b53]">Switch on the methods you accept. Customers pick one at checkout and see exactly how to pay. The money goes straight to you.</p>
              <ul className="mt-10 grid gap-4">
                {[
                  { icon: Banknote, name: "Cash on delivery" },
                  { icon: Smartphone, name: "bKash, Nagad and Rocket (Send Money)" },
                  { icon: Landmark, name: "Bank transfer" },
                ].map((m) => (
                  <li key={m.name} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-[#e6e8e2]">
                    <span className="grid size-10 place-items-center rounded-xl bg-[#dcfce9] text-[#0b3d2c]"><m.icon className="size-5" /></span>
                    <span className="flex-1 font-medium">{m.name}</span>
                    <span className="text-sm text-[#0b6e4f]">Available now</span>
                  </li>
                ))}
                <li className="flex items-center gap-4 rounded-2xl p-4 ring-1 ring-[#e6e8e2] ring-inset">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#f2f3ef] text-[#5d6b63]"><Landmark className="size-5" /></span>
                  <span className="flex-1 font-medium text-[#4d5b53]">Online gateways: SSLCommerz, bKash Payment Gateway, Stripe</span>
                  <span className="text-sm text-[#8a958e]">Coming soon</span>
                </li>
              </ul>
            </div>
            <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[2rem] border-[6px] border-[#12201a] bg-white shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/landing/checkout-phone.jpg" alt="Choosing cash on delivery at checkout in a ShopHub store" width={780} height={1560} loading="lazy" className="block w-full" />
            </div>
          </div>
        </section>

        {/* Themes */}
        {themes.length > 0 && (
          <section id="themes" className="scroll-mt-16 border-y border-[#e6e8e2] bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-[84rem] px-5 sm:px-8">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <h2 className={`max-w-xl ${H2}`}>Make it look like your brand.</h2>
                <p className="max-w-md text-[#4d5b53]">Start with a theme, add your logo and colors, or upload your own theme file. Preview it on your store before customers see it.</p>
              </div>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {themes.map((t) => (
                  <figure key={t.id} className="overflow-hidden rounded-2xl ring-1 ring-[#e3e6df]">
                    <ThemeSwatch tokens={t.tokens} name="Your store" />
                    <figcaption className="bg-white px-4 py-3 text-sm font-semibold">{t.name}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Steps */}
        <section id="steps" className="scroll-mt-16 py-20 sm:py-28">
          <div className="mx-auto max-w-[84rem] px-5 sm:px-8">
            <h2 className={H2}>Open in three steps.</h2>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                ["Create your store", "Choose a name and link. Your store is live the moment you sign up."],
                ["Add your products", "Upload photos, set prices and stock, and switch on the payment methods you accept."],
                ["Share your link", "Post it on Facebook, Instagram or WhatsApp. Orders arrive in your admin."],
              ].map(([t, b], i) => (
                <li key={t} className="border-t-2 border-[#12201a] pt-5">
                  <span className="font-display text-4xl font-bold text-[#0b3d2c]">{i + 1}</span>
                  <h3 className="mt-3 text-xl font-semibold">{t}</h3>
                  <p className="mt-2 leading-relaxed text-[#4d5b53]">{b}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-16 border-t border-[#e6e8e2] bg-white py-20 sm:py-28">
          <div className="mx-auto grid max-w-[84rem] gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <h2 className={H2}>Questions, answered.</h2>
            <div className="divide-y divide-[#e6e8e2] border-y border-[#e6e8e2]">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                    {f.q}
                    <ChevronDown className="size-5 shrink-0 text-[#5d6b63] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 max-w-2xl leading-relaxed text-[#4d5b53]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-[84rem] rounded-[2rem] bg-[#0b3d2c] px-6 py-16 text-center text-white sm:px-14 sm:py-20">
            <h2 className={`mx-auto max-w-2xl ${H2}`}>Your first order could come in today.</h2>
            <Link href="/auth/signup" className="mt-9 inline-flex h-12 items-center rounded-full bg-[#36fba1] px-7 text-[15px] font-semibold text-[#0b3d2c] hover:bg-[#6dfdbc]">
              Create your free store
            </Link>
            <p className="mt-4 text-sm text-white/70">Free to start. No credit card.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e6e8e2]">
        <div className="mx-auto grid max-w-[84rem] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Logo className="size-8" />
              <span className="font-display text-[22px] font-bold tracking-[-0.03em]">shophub</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#4d5b53]">The simple way to open an online store, take orders and get paid.</p>
          </div>
          {(
            [
              ["Product", [["Features", "#features"], ["Payments", "#payments"], ["Themes", "#themes"]]],
              ["Get started", [["Create a store", "/auth/signup"], ["Log in", "/auth/login"], ["How it works", "#steps"]]],
              ["Help", [["Questions", "#faq"], ["Demo store", "/store/demo"]]],
            ] as [string, [string, string][]][]
          ).map(([title, links]) => (
            <div key={title}>
              <p className="mb-4 text-sm font-semibold">{title}</p>
              <ul className="grid gap-2.5 text-sm text-[#4d5b53]">
                {links.map(([l, h]) => (
                  <li key={l}>
                    <Link href={h} className="hover:text-[#12201a] hover:underline">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-[84rem] px-5 sm:px-8">
          <p className="border-t border-[#e6e8e2] py-6 text-sm text-[#5d6b63]">© {new Date().getFullYear()} ShopHub</p>
        </div>
      </footer>
    </div>
  )
}
