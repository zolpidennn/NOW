"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Service, ServiceProvider, ServiceCategory, Profile } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, MapPin } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { formatCEP } from "@/lib/viacep"

interface ServiceWithRelations extends Service {
  provider: ServiceProvider
  category: ServiceCategory
}

interface ServiceRequestFormProps {
  service: ServiceWithRelations
  profile: Profile | null
}

export function ServiceRequestForm({ service, profile }: ServiceRequestFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [serviceType, setServiceType] = useState<"residencial" | "condominial" | "empresarial">("residencial")
  const [address, setAddress] = useState(profile?.address || "")
  const [city, setCity] = useState(profile?.city || "")
  const [state, setState] = useState(profile?.state || "")
  const [zipCode, setZipCode] = useState(profile?.zip_code || "")
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      const { data, error: insertError } = await supabase
        .from("service_requests")
        .insert({
          customer_id: user.id,
          service_id: service.id,
          provider_id: service.provider_id,
          service_type: serviceType,
          address,
          city,
          state,
          zip_code: zipCode,
          scheduled_date: scheduledDate?.toISOString(),
          notes,
          total_price: service.base_price,
          status: "pending",
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/dashboard/requests/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao solicitar serviço")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Serviço</CardTitle>
            <CardDescription>Preencha os dados para a solicitação</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Tipo de Serviço</Label>
                <RadioGroup value={serviceType} onValueChange={(value: any) => setServiceType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="residencial" id="residencial" />
                    <Label htmlFor="residencial" className="cursor-pointer font-normal">
                      Residencial
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="condominial" id="condominial" />
                    <Label htmlFor="condominial" className="cursor-pointer font-normal">
                      Condominial
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="empresarial" id="empresarial" />
                    <Label htmlFor="empresarial" className="cursor-pointer font-normal">
                      Empresarial
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  placeholder="Rua, número e complemento"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    placeholder="UF"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    placeholder="00000-000"
                    value={zipCode}
                    onChange={(e) => setZipCode(formatCEP(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data Preferencial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Descreva detalhes adicionais sobre o serviço..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Enviando solicitação..." : "Solicitar Serviço"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Serviço</p>
              <p className="font-medium">{service.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prestador</p>
              <p className="font-medium">{service.provider.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categoria</p>
              <p className="font-medium">{service.category.name}</p>
            </div>
            {service.estimated_duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Duração estimada: {service.estimated_duration} min</span>
              </div>
            )}
            {service.base_price && (
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">Valor estimado</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(service.base_price))}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sobre o Prestador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{service.provider.description}</p>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {service.provider.city}, {service.provider.state}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
