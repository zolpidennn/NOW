"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Search, RefreshCw } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

type ServiceRequest = {
  id: string
  user_id: string
  service_id: string | null
  category_id: string | null
  description: string
  address: string
  phone: string
  status: string
  created_at: string
  updated_at: string
  user: { full_name: string; email: string }
  category: { name: string }
  service: { name: string; provider: { company_name: string } } | null
}

export default function ServiceRequestsMonitoring() {
  const router = useRouter()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")

  useEffect(() => {
    checkAuth()
    loadRequests()

    // Real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel("service-requests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_requests",
        },
        () => {
          loadRequests()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter, sourceFilter])

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

  const loadRequests = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("service_requests")
      .select(
        `
        *,
        user:profiles!service_requests_user_id_fkey(full_name, email),
        category:service_categories(name),
        service:services(name, provider:service_providers(company_name))
      `,
      )
      .order("created_at", { ascending: false })

    if (!error && data) {
      setRequests(data as ServiceRequest[])
    }

    setLoading(false)
  }

  const filterRequests = () => {
    let filtered = [...requests]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter)
    }

    // Filter by source (NOW platform vs third-party companies)
    if (sourceFilter !== "all") {
      if (sourceFilter === "now") {
        filtered = filtered.filter((req) => !req.service_id)
      } else if (sourceFilter === "companies") {
        filtered = filtered.filter((req) => req.service_id)
      }
    }

    setFilteredRequests(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "in_progress":
        return <AlertCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "in_progress":
        return "Em Andamento"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary" as const
      case "in_progress":
        return "default" as const
      case "completed":
        return "default" as const
      case "cancelled":
        return "secondary" as const
      default:
        return "secondary" as const
    }
  }

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    inProgress: requests.filter((r) => r.status === "in_progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
    nowRequests: requests.filter((r) => !r.service_id).length,
    companyRequests: requests.filter((r) => r.service_id).length,
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Atendimentos de Serviços</h1>
            <p className="text-muted-foreground">Monitore todas as solicitações em tempo real</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={loadRequests}>
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

        {/* Stats Cards */}
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
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Em Andamento</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.nowRequests}</div>
              <p className="text-xs text-muted-foreground">NOW</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.companyRequests}</div>
              <p className="text-xs text-muted-foreground">Empresas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, email, categoria..."
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
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
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

        {/* Requests List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">Nenhum atendimento encontrado</p>
              <p className="text-sm text-muted-foreground">Tente ajustar os filtros de busca</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getStatusVariant(request.status)} className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {getStatusLabel(request.status)}
                        </Badge>
                        {request.service_id ? (
                          <Badge variant="outline">Empresa: {request.service?.provider?.company_name}</Badge>
                        ) : (
                          <Badge variant="outline">NOW Platform</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(request.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>

                      <div>
                        <p className="font-semibold">{request.user?.full_name || "Cliente não identificado"}</p>
                        <p className="text-sm text-muted-foreground">{request.user?.email}</p>
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">Categoria: </span>
                        {request.category?.name || "Não especificada"}
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">Descrição: </span>
                        <span className="text-muted-foreground">
                          {request.description?.substring(0, 100)}
                          {request.description?.length > 100 ? "..." : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <Link href={`/admin/dashboard/service-requests/${request.id}`}>
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                        </Button>
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        <div>{request.phone}</div>
                        <div className="truncate max-w-[200px]">{request.address}</div>
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
