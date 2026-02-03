"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface GeneralServiceRequestFormProps {
  profile: any
  categories: any[]
  services: any[]
  preSelectedCategory?: string
}

export function GeneralServiceRequestForm({
  profile,
  categories,
  services,
  preSelectedCategory,
}: GeneralServiceRequestFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(preSelectedCategory || "")
  const [selectedService, setSelectedService] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const supabase = createClient()

      const requestData = {
        user_id: profile.id,
        service_id: selectedService || null,
        category_id: selectedCategory || null,
        description: formData.get("description"),
        address: formData.get("address") || profile.address,
        phone: formData.get("phone") || profile.phone,
        preferred_date: formData.get("preferred_date"),
        preferred_time: formData.get("preferred_time"),
        status: "pending",
      }

      const { data, error } = await supabase.from("service_requests").insert([requestData]).select().single()

      if (error) throw error

      // Redirecionar para a página de sucesso ou detalhes do pedido
      router.push(`/dashboard/requests/${data.id}`)
    } catch (error) {
      console.error("Error submitting request:", error)
      alert("Erro ao enviar solicitação. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredServices = selectedCategory
    ? services.filter((s) => s.category_id === selectedCategory || s.category?.slug === selectedCategory)
    : services

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Categoria */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoria do Serviço *</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Serviço específico (opcional) */}
      {filteredServices.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="service">Serviço Específico (opcional)</Label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um serviço" />
            </SelectTrigger>
            <SelectContent>
              {filteredServices.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - {service.provider?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição do Problema *</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Descreva detalhadamente o que precisa ser feito..."
          required
          rows={5}
        />
      </div>

      {/* Endereço */}
      <div className="space-y-2">
        <Label htmlFor="address">Endereço *</Label>
        <Input
          id="address"
          name="address"
          placeholder="Rua, número, complemento"
          defaultValue={profile?.address || ""}
          required
        />
      </div>

      {/* Telefone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone *</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="(00) 00000-0000"
          defaultValue={profile?.phone || ""}
          required
        />
      </div>

      {/* Data preferencial */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="preferred_date">Data Preferencial</Label>
          <Input id="preferred_date" name="preferred_date" type="date" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_time">Horário Preferencial</Label>
          <Select name="preferred_time">
            <SelectTrigger>
              <SelectValue placeholder="Selecione um horário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Manhã (8h - 12h)</SelectItem>
              <SelectItem value="afternoon">Tarde (12h - 18h)</SelectItem>
              <SelectItem value="evening">Noite (18h - 22h)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botão de envio */}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Solicitar Serviço"
        )}
      </Button>
    </form>
  )
}
