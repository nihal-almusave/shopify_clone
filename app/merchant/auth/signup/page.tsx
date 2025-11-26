"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repeatPassword: "",
    storeName: "",
    storeSlug: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!formData.storeName.trim()) {
      setError("Store name is required")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/merchant/dashboard`,
          data: {
            store_name: formData.storeName,
            store_slug: formData.storeSlug || formData.storeName.toLowerCase().replace(/\s+/g, "-"),
          },
        },
      })
      if (error) throw error
      router.push("/merchant/auth/verify-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="w-full max-w-md">
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Create Your Store</CardTitle>
          <CardDescription className="text-slate-400">Start selling in minutes with ShopHub</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="storeName" className="text-slate-200">
                Store Name
              </Label>
              <Input
                id="storeName"
                name="storeName"
                placeholder="My Awesome Store"
                required
                value={formData.storeName}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storeSlug" className="text-slate-200">
                Store URL (optional)
              </Label>
              <Input
                id="storeSlug"
                name="storeSlug"
                placeholder="my-awesome-store"
                value={formData.storeSlug}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400">Auto-generated from store name if left blank</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-200">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="repeatPassword" className="text-slate-200">
                Confirm Password
              </Label>
              <Input
                id="repeatPassword"
                name="repeatPassword"
                type="password"
                required
                value={formData.repeatPassword}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating store..." : "Create Store"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/merchant/auth/login" className="text-blue-400 underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
