import { requireMerchant } from "@/lib/auth"
import type { ThemeTokens } from "@/lib/themes"
import { SettingsForm } from "@/components/admin/settings-form"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const { supabase, merchant } = await requireMerchant()
  const { data: themes } = await supabase
    .from("themes")
    .select("id, name, description, preview_url, tokens")
    .eq("is_published", true)
    .order("created_at", { ascending: true })
  return <SettingsForm merchant={merchant} themes={(themes ?? []) as { id: string; name: string; description: string | null; preview_url: string | null; tokens: ThemeTokens }[]} />
}
