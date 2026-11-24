import { notFound } from "next/navigation"
import { requirePlatformAdmin } from "@/lib/platform"
import type { Theme } from "@/lib/themes"
import { ThemeEditor } from "@/components/platform/theme-editor"

export default async function EditThemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await requirePlatformAdmin()
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const { data } = await supabase.from("themes").select("*").eq("id", id).maybeSingle<Theme>()
  if (!data) notFound()
  return <ThemeEditor adminId={user.id} theme={data} />
}
