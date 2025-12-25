"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Building2, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

type ServiceProvider = {
  id: string
  company_name: string
  contact_name: string | null
  email: string
  phone: string
  address: string
  service_categories: string[] | null
  description: string | null
  is_active: boolean
  rating: number
  total_services: number
  provider_type?: string
  verification_status?: string
  cnpj?: string | null
  cpf?: string | null
}

const serviceCategories = [
  "Câmeras de Segurança",
  "Alarmes",
  "Interfones",
  "Controle de Acesso",
  "Cerca Elétrica",
  "Automatização",
  "Manutenção",
]

export default function CompanyManagement() {
  const router = useRouter()
  const [companies, setCompanies] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingCompany, setEditingCompany] = useState<ServiceProvider | null>(null)
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    service_categories: [] as string[],
    description: "",
  })

  useEffect(() => {
    checkAuth()
    loadCompanies()
  }, [])

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

  const loadCompanies = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("service_providers")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setCompanies(data)
    } else if (error) {
      console.error("[v0] Error loading companies:", error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.service_categories.length === 0) {
      alert("Por favor, selecione pelo menos uma categoria de serviço.")
      return
    }

    const supabase = createClient()

    const companyData = {
      company_name: formData.company_name,
      contact_name: formData.contact_name || null,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      service_categories: formData.service_categories,
      description: formData.description || null,
      is_active: true,
      rating: 5.0,
      total_services: 0,
      provider_type: "PJ", // Default to PJ for admin-created companies
      verification_status: "verified", // Admin-created companies are pre-verified
      city: "São Paulo", // Default values - admin can edit later
      state: "SP",
      zip_code: "00000-000",
    }

    if (editingCompany) {
      const updateData = {
        company_name: formData.company_name,
        contact_name: formData.contact_name || null,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        service_categories: formData.service_categories,
        description: formData.description || null,
      }

      const { error } = await supabase.from("service_providers").update(updateData).eq("id", editingCompany.id)

      if (!error) {
        alert("Empresa atualizada com sucesso!")
        resetForm()
        loadCompanies()
      } else {
        console.error("[v0] Error updating company:", error)
        alert("Erro ao atualizar empresa: " + error.message)
      }
    } else {
      const { error } = await supabase.from("service_providers").insert([companyData])

      if (!error) {
        alert("Empresa adicionada com sucesso!")
        resetForm()
        loadCompanies()
      } else {
        console.error("[v0] Error adding company:", error)
        alert("Erro ao adicionar empresa: " + error.message)
      }
    }
  }

  const handleEdit = (company: ServiceProvider) => {
    setEditingCompany(company)
    setFormData({
      company_name: company.company_name,
      contact_name: company.contact_name || "",
      email: company.email,
      phone: company.phone,
      address: company.address,
      service_categories: company.service_categories || [],
      description: company.description || "",
    })
    setShowDialog(true)
  }

  const handleDelete = async (companyId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return

    const supabase = createClient()
    const { error } = await supabase.from("service_providers").delete().eq("id", companyId)

    if (!error) {
      alert("Empresa excluída com sucesso!")
      loadCompanies()
    } else {
      console.error("[v0] Error deleting company:", error)
      alert("Erro ao excluir empresa: " + error.message)
    }
  }

  const toggleActive = async (company: ServiceProvider) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("service_providers")
      .update({ is_active: !company.is_active })
      .eq("id", company.id)

    if (!error) {
      loadCompanies()
    } else {
      console.error("[v0] Error toggling active status:", error)
    }
  }

  const resetForm = () => {
    setEditingCompany(null)
    setFormData({
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      address: "",
      service_categories: [],
      description: "",
    })
    setShowDialog(false)
  }

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      service_categories: prev.service_categories.includes(category)
        ? prev.service_categories.filter((c) => c !== category)
        : [...prev.service_categories, category],
    }))
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Empresas Credenciadas</h1>
            <p className="text-muted-foreground">Adicione, edite ou remova empresas parceiras</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Empresa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCompany ? "Editar Empresa" : "Adicionar Nova Empresa"}</DialogTitle>
                  <DialogDescription>Preencha as informações da empresa credenciada</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="company_name">Nome da Empresa *</Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_name">Nome do Contato</Label>
                      <Input
                        id="contact_name"
                        value={formData.contact_name}
                        onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Endereço *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Categorias de Serviço *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {serviceCategories.map((category) => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.service_categories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="rounded"
                          />
                          <span className="text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      placeholder="Descreva os serviços e diferenciais da empresa"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingCompany ? "Atualizar" : "Adicionar"} Empresa
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : companies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">Nenhuma empresa cadastrada</p>
              <p className="text-sm text-muted-foreground">Adicione sua primeira empresa credenciada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {companies.map((company) => (
              <Card key={company.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {company.company_name}
                        </h3>
                        {company.contact_name && (
                          <p className="text-sm text-muted-foreground">{company.contact_name}</p>
                        )}
                        {company.verification_status && (
                          <Badge variant="outline" className="mt-1">
                            {company.verification_status === "verified" ? "Verificada" : company.verification_status}
                          </Badge>
                        )}
                      </div>
                      <Badge variant={company.is_active ? "default" : "secondary"}>
                        {company.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{company.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{company.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{company.address}</span>
                      </div>
                    </div>

                    {company.service_categories && company.service_categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {company.service_categories.map((category) => (
                          <Badge key={category} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {company.description && <p className="text-sm text-muted-foreground">{company.description}</p>}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(company)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleActive(company)}>
                        {company.is_active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(company.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
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
