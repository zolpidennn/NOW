"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Package } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  stock_quantity: number
  status: string
  rejection_reason?: string
  views: number
  sales_count: number
  created_at: string
}

export function ProviderProductsManager({ providerId }: { providerId: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock_quantity: "",
  })

  useEffect(() => {
    loadProducts()
  }, [providerId])

  const loadProducts = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("provider_products")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setProducts(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const productData = {
      provider_id: providerId,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: Number.parseFloat(formData.price),
      stock_quantity: Number.parseInt(formData.stock_quantity),
      status: "pending_review",
    }

    if (editingProduct) {
      const { error } = await supabase.from("provider_products").update(productData).eq("id", editingProduct.id)

      if (!error) {
        alert("Produto atualizado! Aguardando nova revisão.")
        resetForm()
        loadProducts()
      }
    } else {
      const { error } = await supabase.from("provider_products").insert([productData])

      if (!error) {
        alert("Produto enviado para revisão da plataforma NOW!")
        resetForm()
        loadProducts()
      }
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    const supabase = createClient()
    const { error } = await supabase.from("provider_products").delete().eq("id", productId)

    if (!error) {
      alert("Produto excluído com sucesso!")
      loadProducts()
    }
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({ name: "", description: "", category: "", price: "", stock_quantity: "" })
    setShowDialog(false)
  }

  const statusMap = {
    pending_review: { label: "Em Revisão", variant: "secondary" as const },
    approved: { label: "Publicado", variant: "default" as const },
    rejected: { label: "Rejeitado", variant: "destructive" as const },
    suspended: { label: "Suspenso", variant: "outline" as const },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciar Produtos</CardTitle>
            <CardDescription>Publique produtos que serão revisados pela plataforma NOW</CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
                <DialogDescription>Produto será enviado para revisão da equipe NOW</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Estoque *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingProduct ? "Atualizar" : "Adicionar"} Produto
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum produto cadastrado ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant={statusMap[product.status as keyof typeof statusMap].variant}>
                          {statusMap[product.status as keyof typeof statusMap].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="font-semibold text-primary">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
                        </span>
                        <span>Estoque: {product.stock_quantity}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {product.views} visualizações
                        </span>
                      </div>
                      {product.rejection_reason && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertDescription>
                            <strong>Motivo da rejeição:</strong> {product.rejection_reason}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingProduct(product)
                          setFormData({
                            name: product.name,
                            description: product.description,
                            category: product.category,
                            price: product.price.toString(),
                            stock_quantity: product.stock_quantity.toString(),
                          })
                          setShowDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
