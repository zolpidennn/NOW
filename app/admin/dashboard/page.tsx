"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Package, Building2, MessageSquare, ShoppingCart, Activity } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalServices: 0,
    totalProviders: 0,
  })

  useEffect(() => {
    checkAuth()
    loadStats()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.email !== "leonardo@oliport.com.br") {
      router.push("/")
      return
    }

    setLoading(false)
  }

  const loadStats = async () => {
    const supabase = createClient()

    const [products, orders, services, providers] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("product_orders").select("id", { count: "exact", head: true }),
      supabase.from("service_requests").select("id", { count: "exact", head: true }),
      supabase.from("service_providers").select("id", { count: "exact", head: true }),
    ])

    setStats({
      totalProducts: products.count || 0,
      totalOrders: orders.count || 0,
      totalServices: services.count || 0,
      totalProviders: providers.count || 0,
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
            <p className="text-muted-foreground">Gerencie toda a plataforma NOW</p>
          </div>
          <Link href="/profile/settings">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">No catálogo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Pedidos totais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServices}</div>
              <p className="text-xs text-muted-foreground">Solicitações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProviders}</div>
              <p className="text-xs text-muted-foreground">Credenciadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="companies">Empresas</TabsTrigger>
            <TabsTrigger value="services">Atendimentos</TabsTrigger>
            <TabsTrigger value="orders">Vendas</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Catálogo de Produtos</CardTitle>
                <CardDescription>Adicione, edite ou remova produtos do catálogo de vendas</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/dashboard/products">
                  <Button className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Gerenciar Produtos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Empresas Credenciadas</CardTitle>
                <CardDescription>
                  Adicione empresas, configure serviços e defina quais empresas serão indicadas para cada categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/dashboard/companies">
                  <Button className="w-full">
                    <Building2 className="h-4 w-4 mr-2" />
                    Gerenciar Empresas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Atendimentos de Serviços</CardTitle>
                <CardDescription>Acompanhe e gerencie todas as solicitações de serviço</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/dashboard/service-requests">
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ver Atendimentos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos de Vendas</CardTitle>
                <CardDescription>Gerencie pedidos do catálogo, rastreamento e entregas</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/dashboard/product-orders">
                  <Button className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Ver Pedidos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
