"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Calendar, MessageSquare, BarChart3 } from "lucide-react"
import { ProviderProductsManager } from "@/components/provider-products-manager"
import { ProviderAppointmentsManager } from "@/components/provider-appointments-manager"
import { ProviderChatsManager } from "@/components/provider-chats-manager"
import { Badge } from "@/components/ui/badge"

interface ProviderDashboardTabsProps {
  provider: any
  stats: {
    totalProducts: number
    publishedProducts: number
    pendingProducts: number
    totalAppointments: number
    unreadMessages: number
  }
  providerId: string
  isTeamMember?: boolean
}

export function ProviderDashboardTabs({ provider, stats, providerId, isTeamMember }: ProviderDashboardTabsProps) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Publicados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedProducts}</div>
            <p className="text-xs text-muted-foreground">{stats.totalProducts} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingProducts}</div>
            <p className="text-xs text-muted-foreground">Aguardando revisão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Serviços solicitados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Não lidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produtos
            {stats.pendingProducts > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats.pendingProducts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="chats" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensagens
            {stats.unreadMessages > 0 && (
              <Badge variant="destructive" className="ml-1">
                {stats.unreadMessages}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProviderProductsManager providerId={providerId} />
        </TabsContent>

        <TabsContent value="appointments">
          <ProviderAppointmentsManager providerId={providerId} />
        </TabsContent>

        <TabsContent value="chats">
          <ProviderChatsManager providerId={providerId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
