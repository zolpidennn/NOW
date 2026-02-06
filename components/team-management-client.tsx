"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Plus, UserCog, MapPin, Phone, Mail } from "lucide-react"

interface TeamMember {
  id: string
  company_id: string
  name: string
  email: string | null
  phone: string | null
  role: string
  is_online: boolean
  is_active: boolean
  latitude: number | null
  longitude: number | null
  created_at: string
}

interface TeamManagementClientProps {
  providerId: string
  initialTeamMembers: TeamMember[]
}

export function TeamManagementClient({ providerId, initialTeamMembers }: TeamManagementClientProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "technician",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from("provider_teams")
        .insert({
          company_id: providerId,
          ...formData,
        })
        .select()
        .single()

      if (error) throw error

      setTeamMembers([data, ...teamMembers])
      setFormData({ name: "", email: "", phone: "", role: "technician" })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error adding team member:", error)
      alert("Erro ao adicionar membro da equipe")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleActive = async (memberId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("provider_teams").update({ is_active: !currentStatus }).eq("id", memberId)

      if (error) throw error

      setTeamMembers(
        teamMembers.map((member) => (member.id === memberId ? { ...member, is_active: !currentStatus } : member)),
      )
    } catch (error) {
      console.error("Error toggling member status:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{teamMembers.length} membros na equipe</div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Membro da Equipe</DialogTitle>
              <DialogDescription>Adicione um novo técnico ou gerente à sua equipe</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technician">Técnico</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCog className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {member.role === "technician" && "Técnico"}
                    {member.role === "manager" && "Gerente"}
                    {member.role === "admin" && "Admin"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {member.is_online && (
                  <Badge variant="default" className="bg-green-500">
                    Online
                  </Badge>
                )}
                {!member.is_active && <Badge variant="secondary">Inativo</Badge>}
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              {member.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {member.email}
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {member.phone}
                </div>
              )}
              {member.latitude && member.longitude && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localização disponível
                </div>
              )}
            </div>

            <Button
              variant={member.is_active ? "outline" : "default"}
              size="sm"
              className="w-full"
              onClick={() => toggleActive(member.id, member.is_active)}
            >
              {member.is_active ? "Desativar" : "Ativar"}
            </Button>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card className="p-12 text-center">
          <UserCog className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhum membro na equipe</h3>
          <p className="text-muted-foreground mb-4">Adicione técnicos e gerentes para começar a gerenciar sua equipe</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Primeiro Membro
          </Button>
        </Card>
      )}
    </div>
  )
}
