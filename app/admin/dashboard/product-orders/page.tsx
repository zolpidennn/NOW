"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Package, Search, RefreshCw, Truck } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

type ProductOrder = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  total_price: number
  status: string
  created_at: string
  user: { full_name: string; email: string }
  product: { name: string; image_url: string; provider_id: string | null }
}

export default function ProductOrdersMonitoring() {
  const router = useRouter()
  const [orders, setOrders] = useState<ProductOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<ProductOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")

  useEffect(() => {
    checkAuth()
    loadOrders()

    // Real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel("product-orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "product_orders",
        },
        () => {
          loadOrders()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, sourceFilter])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.email !== "leonardo@oliport.com.br") {
      router.push("/")
      return
    }
  }

  const loadOrders = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("product_orders")
      .select(
        `
        *,
        user:profiles!product_orders_user_id_fkey(full_name, email),
        product:products(name, image_url, provider_id)
      `,
      )
      .order("created_at", { ascending: false })

    if (!error && data) {
      setOrders(data as ProductOrder[])
    }

    setLoading(false)
  }

  const filterOrders = () => {
    let filtered = [...orders]

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    if (sourceFilter !== "all") {
      if (sourceFilter === "now") {
        filtered = filtered.filter((order) => !order.product?.provider_id)
      } else if (sourceFilter === "companies") {
        filtered = filtered.filter((order) => order.product?.provider_id)
      }
    }

    setFilteredOrders(filtered)
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    nowOrders: orders.filter((o) => !o.product?.provider_id).length,
    companyOrders: orders.filter((o) => o.product?.provider_id).length,
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      processing: "Processando",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pedidos de Vendas</h1>
            <p className="text-muted-foreground">Monitore todas as vendas em tempo real</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={loadOrders}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Link href="/admin/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.shipped}</div>
              <p className="text-xs text-muted-foreground">Enviados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.delivered}</div>
              <p className="text-xs text-muted-foreground">Entregues</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.nowOrders}</div>
              <p className="text-xs text-muted-foreground">NOW</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.companyOrders}</div>
              <p className="text-xs text-muted-foreground">Empresas</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, email, produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="processing">Processando</SelectItem>
              <SelectItem value="shipped">Enviado</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Origens</SelectItem>
              <SelectItem value="now">Apenas NOW</SelectItem>
              <SelectItem value="companies">Apenas Empresas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">Nenhum pedido encontrado</p>
              <p className="text-sm text-muted-foreground">Tente ajustar os filtros de busca</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        {order.product?.image_url ? (
                          <img
                            src={order.product.image_url || "/placeholder.svg"}
                            alt={order.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge>{getStatusLabel(order.status)}</Badge>
                          {order.product?.provider_id ? (
                            <Badge variant="outline">Empresa Credenciada</Badge>
                          ) : (
                            <Badge variant="outline">NOW</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(order.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>

                        <div>
                          <p className="font-semibold">{order.user?.full_name || "Cliente não identificado"}</p>
                          <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                        </div>

                        <div className="text-sm">
                          <span className="font-medium">{order.product?.name}</span>
                          <span className="text-muted-foreground"> × {order.quantity}</span>
                        </div>

                        <div className="text-lg font-bold">R$ {order.total_price.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link href={`/admin/dashboard/product-orders/${order.id}`}>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          <Truck className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </Link>
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
