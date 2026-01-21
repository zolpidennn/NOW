"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { MapPin, Check, Loader2, Plus, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Address = {
  id: string
  label: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  zip_code: string | null
  is_primary: boolean
}

export default function LocationPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [location, setLocation] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserAndAddresses()
  }, [])

  const checkUserAndAddresses = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    // Verificar endereços existentes
    const { data: userAddresses } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false })

    setAddresses(userAddresses || [])
    setIsLoading(false)
  }

  const handleUseLocation = async () => {
    setIsLoading(true)

    if (!("geolocation" in navigator)) {
      alert("Geolocalização não é suportada neste navegador")
      setIsLoading(false)
      return
    }

    try {
      const getPos = () =>
        new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }),
        )

      const position = await getPos()
      const { latitude, longitude } = position.coords

      try {
        const response = await fetch(
          `/api/geocode/reverse?lat=${latitude}&lon=${longitude}`,
        )
        const data = await response.json()

        const addr = data.address || {}
        const street = addr.road || addr.street || addr.pedestrian || addr.residential || addr.footway || ""
        const neighborhood = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || ""
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || ""
        const state = addr.state || addr.region || ""
        const zip_code = addr.postcode || ""

        setLocation({
          street,
          number: "", // Deixar vazio - usuário deve preencher manualmente
          complement: "", // Deixar vazio - usuário deve preencher manualmente
          neighborhood,
          city,
          state,
          zip_code,
        })

        setShowAddressForm(true)
      } catch (error) {
        console.error("Error fetching address:", error)
        alert("Erro ao obter endereço da localização. Tente novamente.")
      }
    } catch (error) {
      console.error("Geolocation error:", error)
      alert("Erro ao acessar localização. Verifique as permissões do navegador.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!location.street || !location.number || !location.neighborhood || !location.city || !location.state) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Salvar no perfil (backward compatibility)
    const fullAddress = `${location.street}, ${location.number}${location.complement ? ` - ${location.complement}` : ''} - ${location.neighborhood}, ${location.city} - ${location.state}`
    await supabase.from("profiles").update({
      address: fullAddress,
      city: location.city,
      state: location.state,
      zip_code: location.zip_code
    }).eq("id", user.id)

    // Salvar na tabela de endereços
    const isFirstAddress = addresses.length === 0

    const addressData = {
      user_id: user.id,
      label: isFirstAddress ? "Principal" : "Localização Atual",
      street: location.street,
      number: location.number,
      complement: location.complement || null,
      neighborhood: location.neighborhood,
      city: location.city,
      state: location.state.toUpperCase(),
      zip_code: location.zip_code || null,
      is_default: isFirstAddress,
      is_primary: isFirstAddress,
    }

    // Verificar se já existe um endereço igual
    const existingAddress = addresses.find(
      (addr) =>
        addr.street === location.street &&
        addr.number === location.number &&
        addr.neighborhood === location.neighborhood
    )

    if (existingAddress) {
      // Atualizar endereço existente
      await supabase.from("addresses").update(addressData).eq("id", existingAddress.id)
    } else {
      // Criar novo endereço
      await supabase.from("addresses").insert([addressData])
    }

    router.push("/")
    setIsSaving(false)
  }

  const handleSelectAddress = async (address: Address) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Atualizar perfil com o endereço selecionado
    const fullAddress = `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''} - ${address.neighborhood}, ${address.city} - ${address.state}`
    await supabase.from("profiles").update({
      address: fullAddress,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code
    }).eq("id", user.id)

    // Marcar como primary se não for
    if (!address.is_primary) {
      await supabase.from("addresses").update({ is_primary: false }).eq("user_id", user.id)
      await supabase.from("addresses").update({ is_primary: true }).eq("id", address.id)
    }

    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-foreground" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não há endereços cadastrados, mostrar submenu
  if (addresses.length === 0 && !showAddressForm) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-md">
          <div className="mb-6 flex items-center gap-3">
            <MapPin className="h-6 w-6 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Localização</h1>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como deseja definir sua localização?</CardTitle>
                <CardDescription>
                  Escolha uma das opções abaixo para continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push("/profile/addresses")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar novo endereço
                </Button>

                <Button
                  onClick={handleUseLocation}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Usar minha localização atual
                </Button>

                <Button
                  onClick={() => router.push("/")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao início
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Se há endereços, mostrar lista para seleção
  if (addresses.length > 0 && !showAddressForm) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <MapPin className="h-6 w-6 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Selecione seu endereço</h1>
          </div>

          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{address.label}</span>
                        {address.is_primary && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.street}, {address.number}
                        {address.complement && ` - ${address.complement}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.neighborhood}, {address.city} - {address.state}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleSelectAddress(address)}
                      size="sm"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Selecionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => router.push("/profile/addresses")}
                variant="outline"
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar endereço
              </Button>

              <Button
                onClick={handleUseLocation}
                variant="outline"
                className="flex-1"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Usar localização
              </Button>
            </div>

            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Formulário de endereço (após usar localização ou adicionar novo)
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddressForm(false)}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <MapPin className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Confirme seu endereço</h1>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label htmlFor="street">Rua *</Label>
              <Input
                id="street"
                value={location.street}
                onChange={(e) => setLocation({ ...location, street: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                value={location.number}
                onChange={(e) => setLocation({ ...location, number: e.target.value })}
                placeholder="123"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              placeholder="Apto, Bloco, etc"
              value={location.complement}
              onChange={(e) => setLocation({ ...location, complement: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input
              id="neighborhood"
              value={location.neighborhood}
              onChange={(e) => setLocation({ ...location, neighborhood: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={location.city}
                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                value={location.state}
                onChange={(e) => setLocation({ ...location, state: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="zip_code">CEP</Label>
            <Input
              id="zip_code"
              value={location.zip_code}
              onChange={(e) => setLocation({ ...location, zip_code: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1" size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar Endereço
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowAddressForm(false)}
              variant="outline"
              size="lg"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
