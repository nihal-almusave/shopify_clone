import type React from "react"
import { requirePlatformAdmin } from "@/lib/platform"
import { PlatformShell } from "@/components/platform/platform-shell"

export const metadata = { title: { default: "Platform · ShopHub", template: "%s · Platform · ShopHub" }, robots: { index: false } }

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requirePlatformAdmin()
  return <PlatformShell email={user.email ?? ""}>{children}</PlatformShell>
}
