import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export const metadata = { title: "Choose a new password" }

/** Reached from the reset email (via /auth/callback, which signs the user in) or from the admin account menu. */
export default async function UpdatePasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/forgot-password?expired=1")
  return <UpdatePasswordForm email={user.email ?? ""} />
}
