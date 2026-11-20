import { createClient } from "@/lib/supabase/client"

const MAX_BYTES = 5 * 1024 * 1024

/** Uploads to the public `store-media` bucket under the merchant's own folder and returns the public URL. */
export async function uploadStoreImage(merchantId: string, file: File, folder: string) {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} isn’t an image`)
  if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 5 MB`)
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "")
  const path = `${merchantId}/${folder}/${crypto.randomUUID()}.${ext}`
  const supabase = createClient()
  const { error } = await supabase.storage.from("store-media").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  })
  if (error) throw new Error(error.message)
  return supabase.storage.from("store-media").getPublicUrl(path).data.publicUrl
}
