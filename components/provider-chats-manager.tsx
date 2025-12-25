"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export function ProviderChatsManager({ providerId }: { providerId: string }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mensagens com Clientes</CardTitle>
        <CardDescription>Chat com clientes que solicitaram serviços</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Sistema de chat em desenvolvimento</p>
          <p className="text-sm text-muted-foreground mt-2">
            Em breve você poderá conversar diretamente com seus clientes
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
