"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Eye, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type Product = {
  id: string
  name: string
  description: string
  price: number
  discount_price: number | null
  image_url: string
  category: string
  brand: string
  model: string
  stock: number
  warranty_months: number
  provider_id: string | null
  is_active: boolean
  views: number
  sales_count: number
  featured: boolean
  shipping_weight: number
}

const categories = [
  "Câmeras de Segurança",
  "Alarmes",
  "Interfones",
  "Controle de Acesso",
  "Cerca Elétrica",
  "Automatização",
  "Acessórios",
]

export default function ProductManagement() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount_price: "",
    image_url: "",
    category: "Câmeras de Segurança", // Updated default value
    brand: "",
    model: "",
    stock: "",
    warranty_months: "12",
    provider_id: "",
    featured: false,
    shipping_weight: "",
  })

  useEffect(() => {
    checkAuth()
    loadProducts()
    loadProviders()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
  
    const {
      data: { user },
    } = await supabase.auth.getUser()
  
    if (!user) {
      router.push("/")
      return
    }
  
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id")
      .maybeSingle()
  
    if (error || !admin) {
      router.push("/")
    }
  }
  

  const loadProducts = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setProducts(data)
    }
    setLoading(false)
  }

  const loadProviders = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("service_providers").select("id, company_name").eq("is_active", true)

    if (data) {
      setProviders(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      discount_price: formData.discount_price ? Number.parseFloat(formData.discount_price) : null,
      image_url: formData.image_url,
      category: formData.category,
      brand: formData.brand,
      model: formData.model,
      stock: Number.parseInt(formData.stock),
      warranty_months: Number.parseInt(formData.warranty_months),
      provider_id: formData.provider_id === "none" || !formData.provider_id ? null : formData.provider_id,
      featured: formData.featured,
      shipping_weight: Number.parseFloat(formData.shipping_weight) || 0,
      is_active: true,
    }

    if (editingProduct) {
      const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id)

      if (!error) {
        alert("Produto atualizado com sucesso!")
        resetForm()
        loadProducts()
      } else {
        console.error("[v0] Error updating product:", error)
        alert("Erro ao atualizar produto: " + error.message)
      }
    } else {
      const { error } = await supabase.from("products").insert([productData])

      if (!error) {
        alert("Produto adicionado com sucesso!")
        resetForm()
        loadProducts()
      } else {
        console.error("[v0] Error adding product:", error)
        alert("Erro ao adicionar produto: " + error.message)
      }
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount_price: product.discount_price?.toString() || "",
      image_url: product.image_url,
      category: product.category,
      brand: product.brand,
      model: product.model,
      stock: product.stock.toString(),
      warranty_months: product.warranty_months.toString(),
      provider_id: product.provider_id || "",
      featured: product.featured,
      shipping_weight: product.shipping_weight?.toString() || "",
    })
    setShowDialog(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    const supabase = createClient()
    const { error } = await supabase.from("products").delete().eq("id", productId)

    if (!error) {
      alert("Produto excluído com sucesso!")
      loadProducts()
    }
  }

  const toggleActive = async (product: Product) => {
    const supabase = createClient()
    const { error } = await supabase.from("products").update({ is_active: !product.is_active }).eq("id", product.id)

    if (!error) {
      loadProducts()
    }
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      discount_price: "",
      image_url: "",
      category: "Câmeras de Segurança", // Updated default value
      brand: "",
      model: "",
      stock: "",
      warranty_months: "12",
      provider_id: "",
      featured: false,
      shipping_weight: "",
    })
    setShowDialog(false)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
            <p className="text-muted-foreground">Adicione, edite ou remova produtos do catálogo</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
                  <DialogDescription>Preencha as informações do produto abaixo</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
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
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brand">Marca</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      />
                    </div>

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
                      <Label htmlFor="discount_price">Preço com Desconto (R$)</Label>
                      <Input
                        id="discount_price"
                        type="number"
                        step="0.01"
                        value={formData.discount_price}
                        onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock">Estoque *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warranty_months">Garantia (meses)</Label>
                      <Input
                        id="warranty_months"
                        type="number"
                        value={formData.warranty_months}
                        onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping_weight">Peso (kg)</Label>
                      <Input
                        id="shipping_weight"
                        type="number"
                        step="0.01"
                        value={formData.shipping_weight}
                        onChange={(e) => setFormData({ ...formData, shipping_weight: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="provider_id">Empresa Vendedora</Label>
                      <Select
                        value={formData.provider_id || undefined}
                        onValueChange={(value) => setFormData({ ...formData, provider_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma (NOW oficial)</SelectItem>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url">URL da Imagem</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="featured">Produto em destaque</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingProduct ? "Atualizar" : "Adicionar"} Produto
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">Nenhum produto cadastrado</p>
              <p className="text-sm text-muted-foreground">Adicione seu primeiro produto ao catálogo</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full md:w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.brand} {product.model && `- ${product.model}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {product.featured && <Badge variant="default">Destaque</Badge>}
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Preço:</span>
                          <p className="font-semibold">R$ {product.price.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Estoque:</span>
                          <p className="font-semibold">{product.stock} un.</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Visualizações:</span>
                          <p className="font-semibold">{product.views || 0}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Vendas:</span>
                          <p className="font-semibold">{product.sales_count || 0}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleActive(product)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {product.is_active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
