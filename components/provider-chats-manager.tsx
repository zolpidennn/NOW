"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, User } from "lucide-react"
import { RequestChat } from "@/components/request-chat"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ChatRequest {
  id: string
  customer_id: string
  service_type: string
  status: string
  notes: string
  created_at: string
  profiles: {
    full_name: string
  } | null
  messages: {
    id: string
    message: string
    created_at: string
    sender_id: string
    is_read: boolean
  }[]
}

export function ProviderChatsManager({ providerId }: { providerId: string }) {
  const [requests, setRequests] = useState<ChatRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [providerId])

  const loadRequests = async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("service_requests")
      .select(`
        id,
        customer_id,
        service_type,
        status,
        notes,
        created_at,
        profiles:customer_id (
          full_name
        ),
        messages (
          id,
          message,
          created_at,
          sender_id,
          is_read
        )
      `)
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setRequests(data as ChatRequest[])
    }
    setLoading(false)
  }

  const getUnreadCount = (messages: any[]) => {
    return messages.filter(m => !m.is_read && m.sender_id !== providerId).length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500"
      case "confirmed":
        return "bg-blue-500/10 text-blue-500"
      case "in_progress":
        return "bg-purple-500/10 text-purple-500"
      case "completed":
        return "bg-green-500/10 text-green-500"
      case "cancelled":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: "Pendente",
      confirmed: "Confirmado",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando conversas...</div>
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mensagens com Clientes</CardTitle>
          <CardDescription>Chat com clientes que solicitaram serviços</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma conversa ainda</p>
            <p className="text-sm text-muted-foreground mt-2">
              As conversas com clientes aparecerão aqui quando houver solicitações de serviço
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mensagens com Clientes</CardTitle>
          <CardDescription>Chat com clientes que solicitaram serviços</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Chat List */}
        <div className="space-y-2">
          {requests.map((request) => {
            const unreadCount = getUnreadCount(request.messages)
            const isSelected = selectedRequest === request.id

            return (
              <Card
                key={request.id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? "ring-2 ring-primary" : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedRequest(request.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {request.profiles?.full_name || "Cliente"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {request.service_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Chat View */}
        <div>
          {selectedRequest ? (
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="text-lg">
                  Conversa com {requests.find(r => r.id === selectedRequest)?.profiles?.full_name || "Cliente"}
                </CardTitle>
                <CardDescription>
                  Solicitação: {requests.find(r => r.id === selectedRequest)?.service_type}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <RequestChat
                  requestId={selectedRequest}
                  initialMessages={requests.find(r => r.id === selectedRequest)?.messages || []}
                  currentUserId={providerId}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <p>Selecione uma conversa para visualizar</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
