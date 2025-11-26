"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/merchant/auth/login")
      } else {
        setUser(user)
      }
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">Loading...</div>
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-700 bg-slate-800">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">ShopHub</h1>
        </div>
        <nav className="p-6 space-y-2">
          <Link href="/merchant/dashboard">
            <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700">
              Dashboard
            </Button>
          </Link>
          <Link href="/merchant/dashboard/products">
            <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700">
              Products
            </Button>
          </Link>
          <Link href="/merchant/dashboard/orders">
            <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700">
              Orders
            </Button>
          </Link>
          <Link href="/merchant/dashboard/store">
            <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700">
              Store Settings
            </Button>
          </Link>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 w-64 p-6 border-t border-slate-700 bg-slate-900/50">
          <p className="text-sm text-slate-400 truncate">{user?.email}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full mt-4 text-slate-300 border-slate-600 hover:bg-slate-800 bg-transparent"
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
