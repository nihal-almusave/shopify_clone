import type React from "react"
import type { Metadata } from "next"
import { Inter, Bricolage_Grotesque } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { AuthLinkForwarder } from "@/components/auth/auth-link-forwarder"
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "ShopHub: Create your online store for free", template: "%s · ShopHub" },
  description: SITE_DESCRIPTION,
  applicationName: "ShopHub",
  keywords: [
    "online store builder",
    "ecommerce website",
    "create online store",
    "online shop Bangladesh",
    "Shopify alternative",
    "cash on delivery",
    "bKash payment",
    "sell online",
  ],
  openGraph: { type: "website", siteName: "ShopHub", url: SITE_URL, title: "ShopHub: Create your online store for free", description: SITE_DESCRIPTION, locale: "en_US" },
  twitter: { card: "summary_large_image", title: "ShopHub: Create your online store for free", description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } } : {}),
  icons: {
    icon: [{ url: "/shophub-icon.svg", type: "image/svg+xml" }, { url: "/api/icon?size=48", type: "image/png", sizes: "48x48" }],
    apple: { url: "/api/icon?size=180", sizes: "180x180" },
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="font-sans antialiased">
        <AuthLinkForwarder />
        {children}
        <Toaster position="bottom-center" theme="dark" />
        <Analytics />
      </body>
    </html>
  )
}
