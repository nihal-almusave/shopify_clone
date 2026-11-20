import "server-only"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Merchant } from "@/lib/types"

/** For admin server components and actions: the signed-in merchant and a scoped client. */
export async function requireMerchant() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: merchant } = await supabase.from("merchants").select("*").eq("id", user.id).single<Merchant>()
  if (!merchant) redirect("/auth/login?error=no-store")
  return { supabase, user, merchant }
}
