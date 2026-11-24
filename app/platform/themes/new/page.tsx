import { requirePlatformAdmin } from "@/lib/platform"
import { ThemeEditor } from "@/components/platform/theme-editor"

export const metadata = { title: "New theme" }

export default async function NewThemePage() {
  const { user } = await requirePlatformAdmin()
  return <ThemeEditor adminId={user.id} />
}
