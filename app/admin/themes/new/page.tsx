import { requireMerchant } from "@/lib/auth"
import { ThemeEditor } from "@/components/platform/theme-editor"

export const metadata = { title: "New theme" }

export default async function NewOwnThemePage() {
  const { merchant } = await requireMerchant()
  return <ThemeEditor adminId={merchant.id} owner={{ id: merchant.id, storeSlug: merchant.store_slug }} />
}
