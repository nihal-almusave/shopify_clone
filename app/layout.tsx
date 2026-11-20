import type React from "react"
import type { Metadata } from "next"
import { Inter, Bricolage_Grotesque } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" })

export const metadata: Metadata = {
  title: { default: "ShopHub — Start selling online", template: "%s · ShopHub" },
  description: "Create an online store, add products, take orders and get paid. All in one place.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-center" theme="dark" />
        <Analytics />
      </body>
    </html>
  )
}
