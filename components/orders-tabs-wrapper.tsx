"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceOrdersList } from "@/components/service-orders-list"
import { ProductOrdersList } from "@/components/product-orders-list"
import ServiceOrderDetailClient from "@/components/service-order-detail-client"
import ProductOrderDetailClient from "@/components/product-order-detail-client"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface ServiceRequest {
  id: string
  service_type: string
  status: string
  scheduled_date: string | null
  address: string
  city: string
  state: string
  zip_code: string | null
  notes: string | null
  total_price: number | null
  created_at: string
  provider_id: string | null
  service_providers: {
    id: string
    company_name: string
    cnpj?: string
    phone?: string
    email?: string
    logo_url?: string
    rating?: number
    total_reviews?: number
  } | null
  service?: {
    name: string
  } | null
  service_categories?: {
    name: string
    icon?: string
  } | null
}

interface ProductOrder {
  id: string
  status: string
  total_price: number
  quantity: number
  unit_price: number
  delivery_address: string
  delivery_city: string
  delivery_state: string
  tracking_code: string | null
  estimated_delivery: string | null
  created_at: string
  products: {
    name: string
    image_url: string
  } | null
}

type SelectedOrder = ServiceRequest | ProductOrder | null
type OrderType = "service" | "product" | null

export function OrdersTabsWrapper({ userId }: { userId: string }) {
  const [selectedOrder, setSelectedOrder] = useState<SelectedOrder>(null)
  const [selectedType, setSelectedType] = useState<OrderType>(null)

  const handleSelectService = (request: ServiceRequest) => {
    setSelectedOrder(request)
    setSelectedType("service")
  }

  const handleSelectProduct = (order: ProductOrder) => {
    setSelectedOrder(order)
    setSelectedType("product")
  }

  const handleGoBack = () => {
    setSelectedOrder(null)
    setSelectedType(null)
  }

  if (selectedOrder && selectedType) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={handleGoBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Voltar para pedidos
        </Button>

        {selectedType === "service" && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">Detalhes do Pedido de Serviço</h2>
            {/* @ts-expect-error Server -> Client prop */}
            <ServiceOrderDetailClient request={selectedOrder} />
          </div>
        )}

        {selectedType === "product" && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-foreground">Detalhes do Pedido</h2>
            {/* @ts-expect-error Server -> Client prop */}
            <ProductOrderDetailClient order={selectedOrder} />
          </div>
        )}
      </div>
    )
  }

  return (
    <Tabs defaultValue="services" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="services" className="text-base">
          Serviços
        </TabsTrigger>
        <TabsTrigger value="products" className="text-base">
          Carrinho
        </TabsTrigger>
      </TabsList>

      <TabsContent value="services" className="space-y-4 mt-4">
        <div className="text-sm text-muted-foreground">
          Acompanhe seus agendamentos, veja dados completos e converse em tempo real com as empresas
        </div>
        <ServiceOrdersList userId={userId} onSelectOrder={handleSelectService} />
      </TabsContent>

      <TabsContent value="products" className="space-y-4 mt-4">
        <div className="text-sm text-muted-foreground">
          Acompanhe suas compras, rastreamento e previsão de entrega
        </div>
        <ProductOrdersList userId={userId} onSelectOrder={handleSelectProduct} />
      </TabsContent>
    </Tabs>
  )
}
