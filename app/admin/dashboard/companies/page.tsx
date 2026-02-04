"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { fetchAddressByCEP, formatCEP } from "@/lib/viacep"
import { ArrowLeft, Plus, Building2, Mail, Phone, MapPin, Edit, Trash2, Eye } from "lucide-react"

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
    // Address fields
    zip_code: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    address: "", // Full address (auto-generated)
    service_categories: [] as string[],
    description: "",
  })
  const [loadingCEP, setLoadingCEP] = useState(false)

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

    // Prepare company data with fallback for missing columns
    const companyData: any = {
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
    }

    // Add separated address fields if they exist in the schema
    try {
      // Try to add separated fields
      companyData.zip_code = formData.zip_code.replace(/\D/g, "")
      companyData.street = formData.street
      companyData.number = formData.number
      companyData.complement = formData.complement || null
      companyData.neighborhood = formData.neighborhood
      companyData.city = formData.city
      companyData.state = formData.state.toUpperCase()
    } catch (error) {
      // Fields don't exist, use combined address
      console.log("Separated address fields not available, using combined address")
    }

    if (editingCompany) {
      const updateData: any = {
        company_name: formData.company_name,
        contact_name: formData.contact_name || null,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        service_categories: formData.service_categories,
        description: formData.description || null,
      }

      // Add separated address fields if they exist
      try {
        updateData.zip_code = formData.zip_code.replace(/\D/g, "")
        updateData.street = formData.street
        updateData.number = formData.number
        updateData.complement = formData.complement || null
        updateData.neighborhood = formData.neighborhood
        updateData.city = formData.city
        updateData.state = formData.state.toUpperCase()
      } catch (error) {
        console.log("Separated address fields not available for update")
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
      zip_code: (company as any).zip_code || "",
      street: (company as any).street || "",
      number: (company as any).number || "",
      complement: (company as any).complement || "",
      neighborhood: (company as any).neighborhood || "",
      city: (company as any).city || "",
      state: (company as any).state || "",
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
      zip_code: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
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

  const handleCEPChange = async (cep: string) => {
    const formattedCEP = formatCEP(cep)
    setFormData({ ...formData, zip_code: formattedCEP })

    if (formattedCEP.replace(/\D/g, "").length === 8) {
      setLoadingCEP(true)
      try {
        const addressData = await fetchAddressByCEP(formattedCEP)
        if (addressData && !addressData.erro) {
          setFormData((prev) => ({
            ...prev,
            street: addressData.logradouro || "",
            neighborhood: addressData.bairro || "",
            city: addressData.localidade || "",
            state: addressData.uf || "",
          }))
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error)
      } finally {
        setLoadingCEP(false)
      }
    }
  }

  const updateFullAddress = () => {
    const { street, number, complement, neighborhood, city, state } = formData
    let fullAddress = ""

    if (street) fullAddress += street
    if (number) fullAddress += `, ${number}`
    if (complement) fullAddress += ` - ${complement}`
    if (neighborhood) fullAddress += ` - ${neighborhood}`
    if (city) fullAddress += `, ${city}`
    if (state) fullAddress += ` - ${state}`

    setFormData((prev) => ({ ...prev, address: fullAddress }))
  }

  // Update full address whenever address components change
  useEffect(() => {
    updateFullAddress()
  }, [formData.street, formData.number, formData.complement, formData.neighborhood, formData.city, formData.state])

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
                      <Label htmlFor="zip_code">CEP *</Label>
                      <div className="relative">
                        <Input
                          id="zip_code"
                          value={formData.zip_code}
                          onChange={(e) => handleCEPChange(e.target.value)}
                          placeholder="00000-000"
                          maxLength={9}
                          required
                        />
                        {loadingCEP && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="street">Rua *</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        placeholder="Nome da rua"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        placeholder="123"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={formData.complement}
                        onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                        placeholder="Apto, Bloco, etc"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                        placeholder="Nome do bairro"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Nome da cidade"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="UF"
                        maxLength={2}
                        required
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Endereço Completo (Gerado Automaticamente)</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        readOnly
                        className="bg-muted"
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
                      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/dashboard/companies/${company.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
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
