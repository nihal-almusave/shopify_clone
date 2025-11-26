"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

export default function StoreSettingsPage() {
  const [store, setStore] = useState<any>(null)
  const [formData, setFormData] = useState({
    storeName: "",
    storeSlug: "",
    description: "",
    email: "",
    phone: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadStore()
  }, [])

  const loadStore = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase.from("merchants").select("*").eq("id", user.id).single()

    if (data) {
      setStore(data)
      setFormData({
        storeName: data.store_name,
        storeSlug: data.store_slug,
        description: data.description || "",
        email: data.email,
        phone: data.phone || "",
      })
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from("merchants")
      .update({
        store_name: formData.storeName,
        store_slug: formData.storeSlug,
        description: formData.description,
        phone: formData.phone,
      })
      .eq("id", user.id)

    setSaving(false)
    loadStore()
  }

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Store Settings</h1>

      <Card className="bg-slate-800 border-slate-700 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">Store Information</CardTitle>
          <CardDescription className="text-slate-400">Manage your store details and information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="storeName" className="text-slate-200">
                Store Name
              </Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="storeSlug" className="text-slate-200">
                Store URL
              </Label>
              <Input
                id="storeSlug"
                value={formData.storeSlug}
                onChange={(e) => setFormData({ ...formData, storeSlug: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-slate-200">
                Description
              </Label>
              <Input
                id="description"
                placeholder="Tell customers about your store"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-slate-700 border-slate-600 text-slate-400"
              />
              <p className="text-xs text-slate-400">Cannot be changed</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-slate-200">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
