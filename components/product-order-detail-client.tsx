"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Truck, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function ProductOrderDetailClient({ order }: { order: any }) {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{order.products?.name || "Pedido"}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(order.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </CardDescription>
            </div>
            <Badge>{order.status}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quantidade: {order.quantity}</span>
            <span className="text-lg font-bold text-primary">R$ {order.total_price?.toFixed(2).replace('.', ',')}</span>
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
    </div>
  )
}

export default ProductOrderDetailClient
