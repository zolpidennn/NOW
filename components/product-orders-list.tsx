"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin, Clock, Truck, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

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

interface ProductOrdersListProps {
  userId: string
  onSelectOrder?: (order: ProductOrder) => void
}

export function ProductOrdersList({ userId, onSelectOrder }: ProductOrdersListProps) {
  const [orders, setOrders] = useState<ProductOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("product_orders")
      .select(
        `
        *,
        products (
          name,
          image_url
        )
      `,
      )
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setOrders(data as ProductOrder[])
    }
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500"
      case "processing":
        return "bg-blue-500/10 text-blue-500"
      case "shipped":
        return "bg-purple-500/10 text-purple-500"
      case "delivered":
        return "bg-green-500/10 text-green-500"
      case "cancelled":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: "Pagamento Pendente",
      processing: "Em Processamento",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Você ainda não tem produtos no seu carrinho</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectOrder?.(order)}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{order.products?.name || "Produto"}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(order.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quantidade: {order.quantity}</span>
              <span className="text-lg font-bold text-primary">
                R$ {order.total_price.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                {order.delivery_address}, {order.delivery_city} - {order.delivery_state}
              </span>
            </div>

            {order.tracking_code && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Truck className="h-4 w-4" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Código de Rastreamento</div>
                  <div className="font-mono text-sm font-semibold">{order.tracking_code}</div>
                </div>
              </div>
            )}

            {order.estimated_delivery && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Previsão de entrega: {new Date(order.estimated_delivery).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
