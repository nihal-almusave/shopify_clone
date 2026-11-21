import Link from "next/link"
import { Check, ImagePlus, Link2, Minus, Plus } from "lucide-react"
import { Logo } from "@/components/logo"
import { SiteNav } from "@/components/marketing/site-nav"
import { HeroRotator } from "@/components/marketing/hero-rotator"
import { photo } from "@/components/marketing/photos"

/* Example storefronts, drawn with the same layout every ShopHub store uses. */
const STORES = [
  { name: "Dhaka Kacchi Co.", slug: "dhaka-kacchi", accent: "#8f1d21", banner: photo("1563379091339-03b21ab4a4f8", 900), note: "Free delivery in Gulshan & Banani", items: [["Mutton kacchi, half", "Tk 650"], ["Borhani, 1 L", "Tk 180"]], wide: true },
  { name: "Common Thread", slug: "common-thread", accent: "#2f4f3e", banner: photo("1523381210434-271e8be1f52b", 700), note: "New colors every Friday", items: [["Heavyweight tee", "$32"], ["Pocket tee", "$28"]] },
  { name: "Kiln & Co", slug: "kiln-and-co", accent: "#9a5b2e", banner: photo("1610701596007-11502861dcfa", 900), note: "Each piece is one of a kind", items: [["Stacking cups, set of 4", "€48"], ["Speckled bowl", "€22"]], wide: true },
  { name: "Ember", slug: "ember", accent: "#3b2a22", banner: photo("1602874801007-bd458bb1b8b6", 700), note: "Hand-poured in small batches", items: [["Cedar candle", "£18"], ["Wick trimmer", "£9"]] },
  { name: "Loud Audio", slug: "loud-audio", accent: "#1f3fbf", banner: photo("1505740420928-5e560c06d30e", 900), note: "2-year warranty on everything", items: [["Studio headphones", "₹ 7,499"], ["Travel case", "₹ 999"]], wide: true },
]

export default function LandingPage() {
  return (
    <div className="bg-white text-[#12201a]">
      <SiteNav />
      <main>
        <HeroRotator />

        {/* Storefront showcase */}
        <section id="stores" className="scroll-mt-16 overflow-x-clip py-24 sm:py-32">
          <div className="mx-auto max-w-[84rem] px-5 sm:px-8">
            <h2 className="max-w-3xl font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-bold tracking-[-0.04em]">
              Every store looks like the person who runs it.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4d5b53]">
              Add your logo, a cover photo and one color. ShopHub builds the rest of the store around them. These are examples; yours could be live tonight.
            </p>
          </div>
          <div className="mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 sm:px-8 [scrollbar-width:thin] lg:px-[max(2rem,calc((100vw_-_84rem)/2_+_2rem))] lg:scroll-px-[max(2rem,calc((100vw_-_84rem)/2_+_2rem))]">
            {STORES.map((s) => (
              <StoreMock key={s.slug} store={s} />
            ))}
          </div>
        </section>

        {/* Admin bento */}
        <section id="admin" className="scroll-mt-16 bg-[#f2f3ef] py-24 sm:py-32">
          <div className="mx-auto max-w-[84rem] px-5 sm:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
              <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-bold tracking-[-0.04em]">
                Run the whole shop from one screen.
              </h2>
              <p className="max-w-md text-lg leading-relaxed text-[#4d5b53] lg:justify-self-end">
                Orders, stock, customers and sales live in one admin that works the same on your phone as on your laptop.
              </p>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-6">
              <Tile className="md:col-span-4 md:row-span-2" title="Every order in one inbox" body="Mark it paid, ship it with a tracking number, or cancel and put the stock back.">
                <OrdersMock />
              </Tile>
              <Tile dark className="md:col-span-2" title="A checkout made for phones" body="One page, no account needed. Cards with Stripe, or cash on delivery.">
                <CheckoutMock />
              </Tile>
              <Tile className="md:col-span-2" title="Stock that counts itself" body="Every sale takes one off. Shoppers see when only a few are left.">
                <StockMock />
              </Tile>
              <Tile className="md:col-span-3" title="Know what’s selling" body="Daily sales, order count and average order value at a glance.">
                <ChartMock />
              </Tile>
              <Tile className="md:col-span-3" title="Your brand, down to the browser tab" body="Logo, cover image, accent color and the little icon in the tab.">
                <BrandMock />
              </Tile>
            </div>
          </div>
        </section>

        {/* Currency band */}
        <section id="currency" className="scroll-mt-16 overflow-hidden bg-[#0b3d2c] py-24 text-white sm:py-32">
          <div className="mx-auto max-w-[84rem] px-5 sm:px-8">
            <p aria-hidden className="font-display text-[clamp(5rem,17vw,15rem)] leading-[0.8] font-bold tracking-[-0.06em] text-transparent [-webkit-text-stroke:2px_rgba(185,255,220,.55)]">
              ৳ ₹ $ € £ ¥
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1] font-bold tracking-[-0.035em]">
                Sell in the currency your customers think in.
              </h2>
              <p className="max-w-md text-lg leading-relaxed text-white/75 md:justify-self-end">
                Set your currency, tax rate and shipping once. Every cart and order is totaled for you, including free shipping over the amount you choose.
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section id="steps" className="scroll-mt-16 py-24 sm:py-32">
          <div className="mx-auto max-w-[84rem] px-5 sm:px-8">
            <h2 className="max-w-2xl font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-bold tracking-[-0.04em]">
              Open in three steps.
            </h2>
            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
              <Step n={1} title="Name your store" body="Pick a name and a link. Your storefront exists the moment you sign up.">
                <div className="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(18,32,26,.08)]">
                  <p className="text-xs text-[#5d6b63]">Store URL</p>
                  <p className="mt-1 rounded-lg border border-[#d5dad3] px-3 py-2 text-sm">
                    <span className="text-[#8a958e]">shophub/store/</span>dhaka-kacchi
                  </p>
                </div>
              </Step>
              <Step n={2} title="Add what you sell" body="Upload photos, set a price and how many you have. Publish when it looks right.">
                <div className="grid grid-cols-3 gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo("1589302168068-964664d93dc0", 300)} alt="" className="col-span-2 row-span-2 aspect-square size-full rounded-xl object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo("1563379091339-03b21ab4a4f8", 200)} alt="" className="aspect-square size-full rounded-xl object-cover" />
                  <div className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-[#b9c2bc] text-[#5d6b63]">
                    <ImagePlus className="size-5" />
                  </div>
                </div>
              </Step>
              <Step n={3} title="Share your link" body="Post it on Facebook, Instagram or WhatsApp. Orders land in your admin.">
                <div className="flex items-center gap-2 rounded-full bg-white py-2 pr-2 pl-4 text-sm shadow-[0_1px_2px_rgba(18,32,26,.08)]">
                  <Link2 className="size-4 shrink-0 text-[#5d6b63]" />
                  <span className="truncate">shophub/store/dhaka-kacchi</span>
                  <span className="ml-auto rounded-full bg-[#0b3d2c] px-3 py-1 text-xs font-semibold text-white">Copy</span>
                </div>
              </Step>
            </ol>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="relative mx-auto max-w-[84rem] overflow-hidden rounded-[2rem] bg-[#0b3d2c] text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo("1495474472287-4d71bcdd2085", 1600)} alt="" className="absolute inset-0 size-full object-cover opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b3d2c] via-[#0b3d2c]/85 to-transparent" />
            <div className="relative px-6 py-20 sm:px-14 sm:py-28">
              <h2 className="max-w-2xl font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-bold tracking-[-0.04em]">
                Your first order could come in tonight.
              </h2>
              <Link
                href="/auth/signup"
                className="mt-10 inline-flex h-13 items-center rounded-full bg-[#36fba1] px-7 py-3.5 text-base font-semibold text-[#0b3d2c] transition-colors hover:bg-[#6dfdbc]"
              >
                Create your store
              </Link>
              <p className="mt-4 text-sm text-white/70">Free to start. No credit card.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e6e8e2] bg-[#f2f3ef]">
        <div className="mx-auto grid max-w-[84rem] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Logo className="size-8" />
              <span className="font-display text-[22px] font-bold tracking-[-0.03em]">shophub</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#4d5b53]">
              The simplest way to open an online store, take orders and get paid.
            </p>
          </div>
          <FooterCol title="Product" links={[["Storefronts", "#stores"], ["Orders & stock", "#admin"], ["Checkout", "#admin"], ["Currencies & tax", "#currency"]]} />
          <FooterCol title="Get started" links={[["Create a store", "/auth/signup"], ["Log in", "/auth/login"], ["How it works", "#steps"]]} />
          <FooterCol title="See it working" links={[["Demo store", "/store/demo"], ["Demo checkout", "/store/demo/cart"]]} />
        </div>
        <div className="mx-auto max-w-[84rem] px-5 sm:px-8">
          <p className="border-t border-[#dfe3dc] py-6 text-sm text-[#5d6b63]">© {new Date().getFullYear()} ShopHub</p>
        </div>
      </footer>
    </div>
  )
}

type Store = (typeof STORES)[number]

function StoreMock({ store }: { store: Store }) {
  return (
    <figure
      className={`shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(18,32,26,.06),0_12px_40px_-12px_rgba(18,32,26,.25)] ring-1 ring-[#e6e8e2] ${store.wide ? "w-[min(86vw,560px)]" : "w-[min(72vw,340px)]"}`}
    >
      <div className="flex items-center gap-1.5 border-b border-[#eceee9] bg-[#f7f8f5] px-3 py-2">
        <span className="size-2 rounded-full bg-[#d9ddd6]" />
        <span className="size-2 rounded-full bg-[#d9ddd6]" />
        <span className="size-2 rounded-full bg-[#d9ddd6]" />
        <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 text-[11px] text-[#5d6b63]">shophub/store/{store.slug}</span>
      </div>
      <div className="px-3 py-1.5 text-center text-[11px] font-medium text-white" style={{ background: store.accent }}>
        {store.note}
      </div>
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="grid size-6 place-items-center rounded-md text-[11px] font-bold text-white" style={{ background: store.accent }}>
          {store.name[0]}
        </span>
        <span className="font-display text-sm font-bold">{store.name}</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={store.banner} alt="" loading="lazy" className={`w-full object-cover ${store.wide ? "h-56" : "h-56"}`} />
      <div className="grid grid-cols-2 gap-3 p-4">
        {store.items.map(([n, p]) => (
          <div key={n}>
            <p className="truncate text-[13px] font-medium">{n}</p>
            <p className="text-[13px]" style={{ color: store.accent }}>{p}</p>
          </div>
        ))}
      </div>
      <figcaption className="sr-only">Example store: {store.name}</figcaption>
    </figure>
  )
}

function Tile({ title, body, children, className = "", dark }: { title: string; body: string; children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-[1.75rem] p-6 sm:p-8 ${dark ? "bg-[#0b3d2c] text-white" : "bg-white"} ${className}`}>
      <div className="flex-1">{children}</div>
      <h3 className="mt-8 font-display text-2xl leading-tight font-bold tracking-[-0.025em]">{title}</h3>
      <p className={`mt-2 max-w-md leading-relaxed ${dark ? "text-white/75" : "text-[#4d5b53]"}`}>{body}</p>
    </div>
  )
}

function Pill({ tone, children }: { tone: "paid" | "pending" | "unfulfilled" | "fulfilled"; children: React.ReactNode }) {
  const styles = {
    paid: "bg-[#e3e3e3] text-[#4a4a4a]",
    pending: "bg-[#ffd6a4] text-[#5e4200]",
    unfulfilled: "bg-[#ffef9d] text-[#4f4700]",
    fulfilled: "bg-[#e3e3e3] text-[#4a4a4a]",
  }[tone]
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${styles}`}>{children}</span>
}

function OrdersMock() {
  const rows: [string, string, string, "paid" | "pending", "unfulfilled" | "fulfilled"][] = [
    ["#1042", "Nusrat Jahan", "Tk 1,480", "paid", "unfulfilled"],
    ["#1041", "Arif Hossain", "Tk 650", "pending", "unfulfilled"],
    ["#1040", "Tahmid Rahman", "Tk 2,130", "paid", "fulfilled"],
    ["#1039", "Sadia Islam", "Tk 830", "paid", "fulfilled"],
    ["#1038", "Rafiq Ahmed", "Tk 1,950", "paid", "fulfilled"],
    ["#1037", "Mehjabin Chowdhury", "Tk 650", "paid", "fulfilled"],
    ["#1036", "Imran Kabir", "Tk 1,300", "paid", "fulfilled"],
  ]
  return (
    <div className="overflow-hidden rounded-2xl bg-[#f2f3ef] p-2 sm:p-3">
      <div className="mb-2 flex gap-1 px-1 text-[12px] font-medium">
        <span className="rounded-md bg-white px-2 py-1 shadow-[0_1px_1px_rgba(0,0,0,.06)]">All</span>
        <span className="px-2 py-1 text-[#5d6b63]">Unfulfilled</span>
        <span className="px-2 py-1 text-[#5d6b63]">Unpaid</span>
      </div>
      <ul className="divide-y divide-[#eceee9] rounded-xl bg-white text-[13px]">
        {rows.map(([n, c, t, pay, ful]) => (
          <li key={n} className="flex items-center gap-3 px-3 py-3">
            <span className="w-12 font-semibold">{n}</span>
            <span className="min-w-0 flex-1 truncate">{c}</span>
            <span className="hidden sm:inline">
              <Pill tone={pay}>{pay === "paid" ? "Paid" : "Payment pending"}</Pill>
            </span>
            <Pill tone={ful}>{ful === "fulfilled" ? "Fulfilled" : "Unfulfilled"}</Pill>
            <span className="w-16 text-right font-medium">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CheckoutMock() {
  return (
    <div className="rounded-2xl bg-white p-4 text-[13px] text-[#12201a]">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo("1589302168068-964664d93dc0", 120)} alt="" className="size-11 rounded-lg object-cover" />
        <span className="flex-1 font-medium">Mutton kacchi × 2</span>
        <span>Tk 1,300</span>
      </div>
      <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-1 border-t border-[#eceee9] pt-3 text-[#4d5b53]">
        <dt>Shipping</dt>
        <dd className="text-right">Free</dd>
        <dt className="font-semibold text-[#12201a]">Total</dt>
        <dd className="text-right font-semibold text-[#12201a]">Tk 1,300</dd>
      </dl>
      <div className="mt-3 rounded-lg bg-[#8f1d21] py-2.5 text-center font-semibold text-white">Complete order</div>
    </div>
  )
}

function StockMock() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-[#f2f3ef] p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo("1610701596007-11502861dcfa", 160)} alt="" className="size-16 rounded-xl object-cover" />
      <div className="flex-1">
        <p className="text-[13px] font-medium">Stacking cups</p>
        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#8a5a00]">
          <span className="size-1.5 rounded-full bg-[#e3a400]" /> Only 3 left
        </p>
      </div>
      <div className="flex items-center rounded-full bg-white px-1 text-[13px] ring-1 ring-[#d5dad3]">
        <Minus className="m-1.5 size-3" />
        <span className="w-4 text-center tabular-nums">3</span>
        <Plus className="m-1.5 size-3" />
      </div>
    </div>
  )
}

function ChartMock() {
  return (
    <div className="rounded-2xl bg-[#f2f3ef] p-4">
      <div className="flex gap-8 text-[12px] text-[#5d6b63]">
        <div>
          Total sales
          <p className="font-display text-xl font-bold text-[#12201a]">Tk 84,350</p>
        </div>
        <div>
          Orders
          <p className="font-display text-xl font-bold text-[#12201a]">96</p>
        </div>
      </div>
      <svg viewBox="0 0 300 80" className="mt-3 h-20 w-full" preserveAspectRatio="none" aria-hidden>
        <path d="M0 62 L25 58 L50 64 L75 50 L100 54 L125 40 L150 46 L175 30 L200 36 L225 22 L250 28 L275 14 L300 10" fill="none" stroke="#0b3d2c" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

function BrandMock() {
  const swatches = ["#8f1d21", "#0b3d2c", "#1f3fbf", "#9a5b2e", "#3b2a22"]
  return (
    <div className="grid gap-3 rounded-2xl bg-[#f2f3ef] p-4">
      <div className="flex gap-2">
        {swatches.map((c, i) => (
          <span key={c} className={`grid size-8 place-items-center rounded-full ${i === 0 ? "ring-2 ring-[#12201a] ring-offset-2 ring-offset-[#f2f3ef]" : ""}`} style={{ background: c }}>
            {i === 0 && <Check className="size-4 text-white" />}
          </span>
        ))}
      </div>
      <div className="rounded-lg bg-[#dde1da] px-2 pt-2">
        <div className="flex max-w-[220px] items-center gap-2 rounded-t-lg bg-white px-3 py-2 text-[12px]">
          <span className="grid size-4 place-items-center rounded-[4px] bg-[#8f1d21] text-[9px] font-bold text-white">D</span>
          Dhaka Kacchi Co.
          <span className="ml-auto text-[#8a958e]">×</span>
        </div>
      </div>
    </div>
  )
}

function Step({ n, title, body, children }: { n: number; title: string; body: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col">
      <div className="flex items-baseline gap-4 border-t-2 border-[#12201a] pt-5">
        <span className="font-display text-5xl font-bold tracking-[-0.04em] text-[#0b3d2c]">{n}</span>
        <h3 className="font-display text-2xl font-bold tracking-[-0.025em]">{title}</h3>
      </div>
      <p className="mt-3 max-w-sm leading-relaxed text-[#4d5b53]">{body}</p>
      <div className="mt-6 rounded-2xl bg-[#f2f3ef] p-5">{children}</div>
    </li>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-4 text-sm font-semibold">{title}</p>
      <ul className="grid gap-2.5 text-sm text-[#4d5b53]">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-[#12201a] hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
