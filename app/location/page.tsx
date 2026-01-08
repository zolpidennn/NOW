"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { MapPin, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LocationPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [location, setLocation] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip: "",
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Request geolocation permission and get coordinates
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          // Reverse geocoding using Nominatim (free service)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            )
            const data = await response.json()

            setLocation({
              street: data.address.road || "",
              number: data.address.house_number || "",
              complement: "",
              neighborhood: data.address.suburb || data.address.neighbourhood || "",
              city: data.address.city || data.address.town || "",
              state: data.address.state || "",
              zip: data.address.postcode || "",
            })
          } catch (error) {
            console.error("Error fetching address:", error)
          } finally {
            setIsLoading(false)
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          setIsLoading(false)
        },
      )
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Salvar no perfil (backward compatibility)
    const fullAddress = `${location.street}, ${location.number} - ${location.neighborhood}, ${location.city} - ${location.state}`
    await supabase.from("profiles").update({ address: fullAddress }).eq("id", user.id)

    // Salvar na tabela de endereços
    const { data: existingAddresses } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)

    const isFirstAddress = !existingAddresses || existingAddresses.length === 0

    const addressData = {
      user_id: user.id,
      label: "Principal",
      street: location.street,
      number: location.number,
      complement: location.complement || null,
      neighborhood: location.neighborhood,
      city: location.city,
      state: location.state.toUpperCase(),
      zip_code: location.zip,
      is_default: isFirstAddress,
    }

    // Verificar se já existe um endereço igual
    const existingAddress = existingAddresses?.find(
      (addr) =>
        addr.street === location.street &&
        addr.number === location.number &&
        addr.zip_code === location.zip
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-foreground" />
          <p className="mt-4 text-muted-foreground">Detectando sua localização...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <MapPin className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Confirme seu endereço</h1>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                value={location.street}
                onChange={(e) => setLocation({ ...location, street: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={location.number}
                onChange={(e) => setLocation({ ...location, number: e.target.value })}
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
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              value={location.neighborhood}
              onChange={(e) => setLocation({ ...location, neighborhood: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={location.city}
                onChange={(e) => setLocation({ ...location, city: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={location.state}
                onChange={(e) => setLocation({ ...location, state: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="zip">CEP</Label>
            <Input id="zip" value={location.zip} onChange={(e) => setLocation({ ...location, zip: e.target.value })} />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full" size="lg">
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
        </div>
      </div>
    </div>
  )
}
