"use client"

import { useState, useEffect } from "react"
import { MapPin, Plus, Edit, Trash2, ArrowLeft, Home, Briefcase, Building2, Star, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { fetchAddressByCEP, formatCEP } from "@/lib/viacep"

type Address = {
  id: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  zipcode: string
  label: string
  is_default: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [zipcodeField, setZipcodeField] = useState("")
  const [formData, setFormData] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipcode: "",
    label: "Casa",
  })
  const [loadingCEP, setLoadingCEP] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false })

    if (data) {
      // Normalize DB fields to the UI shape (zip_code, is_primary vs zipcode, is_default)
      const normalized = data.map((a: any) => ({
        id: a.id,
        street: a.street,
        number: a.number,
        complement: a.complement,
        neighborhood: a.neighborhood,
        city: a.city,
        state: a.state,
        zipcode: a.zip_code || "",
        label: a.label,
        is_default: Boolean(a.is_primary),
      }))

      setAddresses(normalized)
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (
      !formData.street ||
      !formData.number ||
      !formData.neighborhood ||
      !formData.city ||
      !formData.state ||
      !formData.zipcode
    ) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const addressData = {
      street: formData.street,
      number: formData.number,
      complement: formData.complement || null,
      neighborhood: formData.neighborhood,
      city: formData.city,
      state: formData.state.toUpperCase(),
      zip_code: formData.zipcode.replace(/\D/g, ""),
      label: formData.label,
      user_id: user.id,
      is_primary: addresses.length === 0,
    }

    if (editingAddress) {
      await supabase.from("addresses").update(addressData).eq("id", editingAddress.id)
    } else {
      await supabase.from("addresses").insert([addressData])
    }

    resetForm()
    loadAddresses()
  }

  const handleSetDefault = async (id: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Remove default from all addresses (support both flags)
    await supabase.from("addresses").update({ is_primary: false }).eq("user_id", user.id)

    // Set new default
    await supabase.from("addresses").update({ is_primary: true }).eq("id", id)

    loadAddresses()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir este endereço?")) return

    const supabase = createClient()
    await supabase.from("addresses").delete().eq("id", id)
    loadAddresses()
  }

  const resetForm = () => {
    setFormData({
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipcode: "",
      label: "Casa",
    })
    setEditingAddress(null)
    setShowDialog(false)
  }

  const getLabelIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "casa":
        return <Home className="h-4 w-4" />
      case "trabalho":
        return <Briefcase className="h-4 w-4" />
      case "condomínio":
      case "condominio":
        return <Building2 className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Meus Endereços</h1>
          </div>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAddress ? "Editar Endereço" : "Novo Endereço"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Endereço *</Label>
                  <Select value={formData.label} onValueChange={(value) => setFormData({ ...formData, label: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casa">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Casa
                        </div>
                      </SelectItem>
                      <SelectItem value="Trabalho">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Trabalho
                        </div>
                      </SelectItem>
                      <SelectItem value="Condomínio">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Condomínio
                        </div>
                      </SelectItem>
                      <SelectItem value="Outro">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Outro
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.label === "Outro" && (
                  <div className="space-y-2">
                    <Label>Nome Personalizado *</Label>
                    <Input
                      placeholder="Ex: Casa dos pais, Escritório..."
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>CEP *</Label>
                    <div className="relative">
                      <Input
                        value={formData.zipcode}
                        onChange={async (e) => {
                          const formatted = formatCEP(e.target.value)
                          setFormData({ ...formData, zipcode: formatted })
                          
                          // Buscar endereço quando CEP tiver 8 dígitos
                          const cleanCEP = formatted.replace(/\D/g, "")
                          if (cleanCEP.length === 8) {
                            setLoadingCEP(true)
                            const addressData = await fetchAddressByCEP(formatted)
                            if (addressData) {
                              setFormData({
                                ...formData,
                                zipcode: formatted,
                                street: addressData.logradouro || "",
                                neighborhood: addressData.bairro || "",
                                city: addressData.localidade || "",
                                state: addressData.uf || "",
                                complement: addressData.complemento || "",
                              })
                            }
                            setLoadingCEP(false)
                          }
                        }}
                        placeholder="00000-000"
                        maxLength={9}
                        required
                      />
                      {loadingCEP && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Rua *</Label>
                    <Input
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Número *</Label>
                    <Input
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input
                      value={formData.complement}
                      onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                      placeholder="Apto, bloco, etc"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Bairro *</Label>
                    <Input
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cidade *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Estado *</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                      maxLength={2}
                      placeholder="SP"
                      required
                    />
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full">
                  Salvar Endereço
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Nenhum endereço cadastrado</p>
            <p className="text-sm text-muted-foreground">Adicione um endereço para facilitar suas compras</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} className={`p-4 ${address.is_default ? "border-primary" : ""}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getLabelIcon(address.label)}
                        {address.label}
                      </Badge>
                      {address.is_default && (
                        <Badge className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Principal
                        </Badge>
                      )}
                    </div>

                    <p className="font-semibold">
                      {address.street}, {address.number}
                    </p>
                    {address.complement && <p className="text-sm text-muted-foreground">{address.complement}</p>}
                    <p className="text-sm text-muted-foreground">
                      {address.neighborhood}, {address.city} - {address.state}
                    </p>
                    <p className="text-sm text-muted-foreground">CEP: {address.zipcode}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!address.is_default && (
                      <Button size="sm" variant="outline" onClick={() => handleSetDefault(address.id)}>
                        Tornar Principal
                      </Button>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingAddress(address)
                          setFormData({
                            street: address.street,
                            number: address.number,
                            complement: address.complement || "",
                            neighborhood: address.neighborhood,
                            city: address.city,
                            state: address.state,
                            zipcode: address.zipcode,
                            label: address.label || "Casa",
                          })
                          setShowDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(address.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
