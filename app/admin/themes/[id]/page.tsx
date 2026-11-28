import { notFound } from "next/navigation"
import { requireMerchant } from "@/lib/auth"
import type { Theme } from "@/lib/themes"
import { ThemeEditor } from "@/components/platform/theme-editor"

export default async function EditOwnThemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const { supabase, merchant } = await requireMerchant()
  const { data } = await supabase.from("themes").select("*").eq("id", id).eq("owner_id", merchant.id).maybeSingle<Theme>()
  if (!data) notFound()
  return <ThemeEditor adminId={merchant.id} owner={{ id: merchant.id, storeSlug: merchant.store_slug }} theme={data} />
}
