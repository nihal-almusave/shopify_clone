"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("merchant_id", user.id)
      .order("created_at", { ascending: false })

    setProducts(data || [])
    setLoading(false)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from("products").insert({
      merchant_id: user.id,
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      quantity: Number.parseInt(formData.quantity),
      category: formData.category,
      is_published: true,
    })

    if (!error) {
      setFormData({ name: "", description: "", price: "", quantity: "", category: "" })
      setShowForm(false)
      loadProducts()
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    const supabase = createClient()
    await supabase.from("products").delete().eq("id", productId)
    loadProducts()
  }

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Products</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add Product"}</Button>
      </div>

      {showForm && (
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-slate-200">
                  Product Name
                </Label>
                <Input
                  id="name"
                  placeholder="Product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-slate-200">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Product description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-slate-200">
                    Price ($)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quantity" className="text-slate-200">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category" className="text-slate-200">
                  Category
                </Label>
                <Input
                  id="category"
                  placeholder="Product category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <Button type="submit" className="w-full">
                Add Product
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400">No products yet. Add your first product to get started!</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">{product.description}</p>
                    <div className="flex gap-4 mt-3 text-sm text-slate-400">
                      <span>Price: ${product.price}</span>
                      <span>Stock: {product.quantity}</span>
                      <span>Category: {product.category || "Uncategorized"}</span>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
