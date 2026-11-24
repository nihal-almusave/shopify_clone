import { requireMerchant } from "@/lib/auth"
import { SettingsForm } from "@/components/admin/settings-form"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const { merchant } = await requireMerchant()
  return <SettingsForm merchant={merchant} />
}
