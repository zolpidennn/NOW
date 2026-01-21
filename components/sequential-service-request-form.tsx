"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight, MapPin, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import dynamic from "next/dynamic"

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker components for Leaflet
const createUserIcon = (profileImage?: string) => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-12 h-12 rounded-full border-4 border-blue-500 shadow-lg overflow-hidden bg-white">
          ${profileImage ? 
            `<img src="${profileImage}" alt="Sua foto" class="w-full h-full object-cover" />` :
            `<div class="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">👤</div>`
          }
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rotate-45 border-2 border-white"></div>
      </div>
    `,
    className: 'custom-user-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  })
}

const createProviderIcon = (provider: any) => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-14 h-14 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
          ${provider.profile_image ? 
            `<img src="${provider.profile_image}" alt="${provider.company_name}" class="w-full h-full object-cover" />` :
            `<div class="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-xl">${provider.company_name.charAt(0)}</div>`
          }
        </div>
        <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-white border-2 border-gray-300 rotate-45"></div>
      </div>
    `,
    className: 'custom-provider-marker',
    iconSize: [56, 56],
    iconAnchor: [28, 56],
  })
}

interface SequentialServiceRequestFormProps {
  profile: any
  categories: any[]
  services: any[]
  preSelectedCategory?: string
}

export function SequentialServiceRequestForm({
  profile,
  categories,
  services,
  preSelectedCategory,
}: SequentialServiceRequestFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(preSelectedCategory || "")
  const [selectedService, setSelectedService] = useState("")
  const [address, setAddress] = useState(profile?.address || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [description, setDescription] = useState("")
  const [productModel, setProductModel] = useState("")

  const [assignedProvider, setAssignedProvider] = useState<any>(null)
  const [providerLoading, setProviderLoading] = useState(false)

  // New states for step 6
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearbyProviders, setNearbyProviders] = useState<any[]>([])
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [userIcon, setUserIcon] = useState<L.DivIcon | null>(null)
  const [providerIcons, setProviderIcons] = useState<Map<string, L.DivIcon>>(new Map())

  const totalSteps = 6 // Updated from 7 to 6

  useEffect(() => {
    if (step === 6 && !userLocation) {
      setLocationLoading(true)

      // First, try to geocode the profile address
      const geocodeAddress = async () => {
        if (profile?.address) {
          try {
            const response = await fetch(`/api/geocode/forward?address=${encodeURIComponent(profile.address)}`)
            const data = await response.json()

            if (data && data.length > 0) {
              const { lat, lon } = data[0]
              setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lon) })
              findNearbyProviders(parseFloat(lat), parseFloat(lon))
              setLocationLoading(false)
              return
            }
          } catch (error) {
            console.error("Error geocoding profile address:", error)
          }
        }

        // Fallback to geolocation
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setUserLocation({ lat: latitude, lng: longitude })
            findNearbyProviders(latitude, longitude)
            setLocationLoading(false)
          },
          (error) => {
            console.error("Error getting location:", error)
            // Fallback to a default location (e.g., São Paulo)
            const defaultLat = -23.5505
            const defaultLng = -46.6333
            setUserLocation({ lat: defaultLat, lng: defaultLng })
            findNearbyProviders(defaultLat, defaultLng)
            setLocationLoading(false)
          }
        )
      }

      geocodeAddress()
    }
  }, [step, profile?.address])

  // Create custom icons when data is available
  useEffect(() => {
    if (typeof window !== 'undefined' && profile) {
      setUserIcon(createUserIcon(profile.avatar_url || profile.profile_image))
    }
  }, [profile])

  useEffect(() => {
    if (typeof window !== 'undefined' && nearbyProviders.length > 0) {
      const icons = new Map<string, L.DivIcon>()
      nearbyProviders.forEach(provider => {
        icons.set(provider.id, createProviderIcon(provider))
      })
      setProviderIcons(icons)
    }
  }, [nearbyProviders])

  const handleNext = () => {
    if (step === 1 && !selectedCategory) {
      alert("Por favor, selecione uma categoria de serviço")
      return
    }
    if (step === 1 && filteredServices.length > 0 && !selectedService) {
      alert("Por favor, selecione um serviço específico")
      return
    }
    if (step === 2 && !address) {
      alert("Por favor, confirme o endereço")
      return
    }
    if (step === 3 && !acceptedTerms) {
      alert("Você precisa aceitar os termos para continuar")
      return
    }
    if (step === 4 && !phone) {
      alert("Por favor, confirme o número de telefone")
      return
    }
    if (step === 5 && !description) {
      alert("Por favor, descreva o problema")
      return
    }

    setStep(step + 1)
  }

  const handleBack = () => {
    if (step === 1) {
      router.back()
    } else {
      setStep(step - 1)
    }
  }

  const findNearbyProviders = async (lat: number, lng: number) => {
    setProviderLoading(true)
    try {
      const supabase = createClient()

      // Find all active and verified providers
      const { data: providers } = await supabase
        .from("service_providers")
        .select("*")
        .eq("is_active", true)
        .eq("verification_status", "verified")

      if (!providers || providers.length === 0) {
        setNearbyProviders([])
        return
      }

      // Geocode each provider's address to get real coordinates
      const geocodedProviders = await Promise.all(
        providers.map(async (provider) => {
          try {
            const fullAddress = `${provider.address}, ${provider.city}, ${provider.state}, ${provider.zip_code}, Brasil`
            const response = await fetch(`/api/geocode/forward?address=${encodeURIComponent(fullAddress)}`)
            const data = await response.json()

            if (data && data.length > 0) {
              const providerLat = parseFloat(data[0].lat)
              const providerLng = parseFloat(data[0].lon)

              // Calculate distance using Haversine formula
              const distance = calculateDistance(lat, lng, providerLat, providerLng)

              return {
                ...provider,
                lat: providerLat,
                lng: providerLng,
                distance: distance,
              }
            } else {
              // If geocoding fails, place provider at a default distance
              return {
                ...provider,
                lat: lat + (Math.random() - 0.5) * 0.02,
                lng: lng + (Math.random() - 0.5) * 0.02,
                distance: 999, // Mark as far away
              }
            }
          } catch (error) {
            console.error(`Error geocoding provider ${provider.id}:`, error)
            return {
              ...provider,
              lat: lat + (Math.random() - 0.5) * 0.02,
              lng: lng + (Math.random() - 0.5) * 0.02,
              distance: 999,
            }
          }
        })
      )

      // Sort by distance and take the closest 20
      const sortedProviders = geocodedProviders
        .filter(p => p.distance < 50) // Only show providers within 50km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20)

      setNearbyProviders(sortedProviders)
    } catch (error) {
      console.error("[v0] Error finding nearby providers:", error)
      setNearbyProviders([])
    } finally {
      setProviderLoading(false)
    }
  }

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Find the closest provider
  const findClosestProvider = () => {
    if (nearbyProviders.length === 0) return

    const closest = nearbyProviders.reduce((prev, current) =>
      (prev.distance < current.distance) ? prev : current
    )

    // Center map on the closest provider
    if (userLocation) {
      // You could use a map ref here to pan to the provider
      // For now, just select it
      setSelectedProvider(closest)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Construir endereço completo (número vai no campo notes ou em endereço separado visualmente)
      // Na tabela service_requests, o campo address armazena o endereço completo
      // Mas na interface, o número fica em campo separado conforme solicitado
      const requestData: any = {
        customer_id: profile.id,
        service_type: selectedCategoryData?.name || "residencial",
        address: address, // Endereço completo
        city: profile?.city || "",
        state: profile?.state || "",
        zip_code: profile?.zip_code || "",
        notes: description,
        status: "pending",
      }

      if (selectedService) {
        requestData.service_id = selectedService
      }

      // Se tem provider atribuído
      if (selectedProvider?.id) {
        requestData.provider_id = selectedProvider.id
      }

      const { data, error } = await supabase.from("service_requests").insert([requestData]).select().single()

      if (error) throw error

      router.push(`/orders`)
    } catch (error) {
      console.error("[v0] Error submitting request:", error)
      alert("Erro ao enviar solicitação. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredServices = selectedCategory
    ? services.filter((s) => s.category_id === selectedCategory || s.category?.slug === selectedCategory)
    : services

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory)

  return (
    <>
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: none;
          padding: 0;
        }
        .leaflet-popup-tip {
          border-width: 8px;
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .custom-user-marker, .custom-provider-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs ${
                s <= step ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
              }`}
            >
              {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            {s < totalSteps && <div className={`h-1 w-8 ${s < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Confirm Service Category */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Confirme o tipo de serviço</h2>
              <p className="text-muted-foreground">Qual serviço você precisa?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria do Serviço *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

            {selectedCategoryData && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Serviço selecionado:</p>
                <p className="text-lg font-bold">{selectedCategoryData.name}</p>
              </div>
            )}

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
                        {service.name} - {service.provider?.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Confirm Address */}
      {step === 2 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Confirme o endereço</h2>
              <p className="text-muted-foreground">Onde o serviço será realizado?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço completo *</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Endereço confirmado:</p>
              <p className="text-sm">{address}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Terms and Policies */}
      {step === 3 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Política da Plataforma</h2>
              <p className="text-muted-foreground">Leia e aceite os termos para continuar</p>
            </div>

            <div className="bg-muted p-6 rounded-lg space-y-4 max-h-[400px] overflow-y-auto">
              <h3 className="font-semibold">Termos de Uso - NOW</h3>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>1. Natureza da Plataforma:</strong> A NOW é uma plataforma digital que 
                  conecta usuários a prestadores de serviços de segurança eletrônica cadastrados. A NOW não executa os serviços, atuando apenas como intermediadora.
                </p>

                <p>
                  <strong>2. Agendamento e Cancelamento:</strong> Após confirmar a solicitação, você receberá o contato
                  da empresa credenciada em até 24 horas. Cancelamentos devem ser feitos com pelo menos 2 horas de
                  antecedência.
                </p>

                <p>
                  <strong>3. Pagamento:</strong> Os valores dos serviços são definidos pelo prestador. A NOW poderá 
                  cobrar taxas ou comissões pela intermediação, sempre de forma clara e informada antes da contratação.
                </p>

                <p>
                  <strong>4. Privacidade:</strong> Seus dados são utilizados apenas para viabilizar a conexão com os 
                  prestadores e melhorar sua experiência, em conformidade com a LGPD.
                </p>

                <p>
                  <strong>5. Suporte:</strong> Em caso de problemas, nossa equipe está disponível para mediar e resolver
                  qualquer questão.
                </p>

                <p>
                  <strong>6. Suporte:</strong> A NOW pode atualizar estes termos a qualquer momento. O uso contínuo da 
                  plataforma indica concordância com as alterações.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(!!checked)} />
              <label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
                Li e aceito os termos e políticas da plataforma NOW
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirm Phone */}
      {step === 4 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Confirme seu telefone</h2>
              <p className="text-muted-foreground">Como a empresa pode entrar em contato?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Telefone confirmado:</p>
              <p className="text-lg font-bold">{phone || "Nenhum telefone informado"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Problem Description */}
      {step === 5 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Descreva o problema</h2>
              <p className="text-muted-foreground">Quanto mais detalhes, melhor</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Problema *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Preciso instalar 4 câmeras de segurança na parte externa da casa, incluindo cabeamento e configuração do sistema..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productModel">Produto/Modelo (se aplicável)</Label>
              <Input
                id="productModel"
                value={productModel}
                onChange={(e) => setProductModel(e.target.value)}
                placeholder="Ex: Câmera Intelbras VHL 1120 B"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Select Provider on Map */}
      {step === 6 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {locationLoading ? (
              <div className="text-center space-y-4 py-8">
                <MapPin className="h-16 w-16 mx-auto animate-pulse text-primary" />
                <h2 className="text-2xl font-bold">Localizando você...</h2>
                <p className="text-muted-foreground">Estamos encontrando empresas próximas à sua localização</p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </div>
            ) : userLocation ? (
              <>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Escolha uma empresa credenciada</h2>
                  <p className="text-muted-foreground">Selecione no mapa a empresa que deseja contratar</p>
                  <Button
                    onClick={findClosestProvider}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Encontrar empresa mais próxima
                  </Button>
                </div>

                <div className="h-96 w-full rounded-lg overflow-hidden border relative">
                  <MapContainer
                    center={[userLocation.lat, userLocation.lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-lg"
                    maxBounds={[[userLocation.lat - 0.1, userLocation.lng - 0.1], [userLocation.lat + 0.1, userLocation.lng + 0.1]]}
                    maxBoundsViscosity={1.0}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {/* User location marker */}
                    {userIcon && (
                      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup>
                          <div className="text-center p-2">
                            <MapPin className="h-6 w-6 mx-auto text-blue-500" />
                            <p className="font-semibold">Sua localização</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    {/* Provider markers */}
                    {nearbyProviders.map((provider) => {
                      const icon = providerIcons.get(provider.id)
                      return icon ? (
                        <Marker key={provider.id} position={[provider.lat, provider.lng]} icon={icon}>
                          <Popup>
                            <div className="space-y-3 min-w-[250px] p-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                  {provider.profile_image ? (
                                    <img
                                      src={provider.profile_image}
                                      alt={provider.company_name || provider.individual_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                                      {(provider.company_name || provider.individual_name || 'P').charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{provider.company_name || provider.individual_name}</h3>
                                  <p className="text-sm text-muted-foreground">{provider.description || 'Serviços especializados'}</p>
                                  <p className="text-xs text-muted-foreground">{provider.distance?.toFixed(1)} km de distância</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{provider.rating?.toFixed(1) || '5.0'}</span>
                                <span className="text-sm text-muted-foreground">({provider.total_reviews || 0} avaliações)</span>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => setSelectedProvider(provider)}
                                className="w-full"
                              >
                                Selecionar Empresa
                              </Button>
                            </div>
                          </Popup>
                        </Marker>
                      ) : null
                    })}
                  </MapContainer>
                </div>

                {selectedProvider && (
                  <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold">Empresa Selecionada:</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        {selectedProvider.profile_image ? (
                          <img
                            src={selectedProvider.profile_image}
                            alt={selectedProvider.company_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                            {selectedProvider.company_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{selectedProvider.company_name}</p>
                        <p className="text-sm text-muted-foreground">{selectedProvider.specialty || 'Segurança Eletrônica'}</p>
                        <p className="text-xs text-primary font-medium">Credenciada pela NOW</p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{selectedProvider.rating?.toFixed(1) || '5.0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProvider(null)}
                    disabled={!selectedProvider}
                    className="flex-1"
                  >
                    Escolher Outra
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedProvider || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Solicitando...
                      </>
                    ) : (
                      "Solicitar Serviço"
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-2 py-8">
                <h2 className="text-2xl font-bold">Erro de localização</h2>
                <p className="text-muted-foreground">
                  Não conseguimos acessar sua localização. Verifique as permissões do navegador.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="flex-1 bg-transparent"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step === 1 ? "Cancelar" : "Voltar"}
        </Button>

        {step < 6 ? (
          <Button type="button" onClick={handleNext} className="flex-1">
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Confirmar Solicitação"
            )}
          </Button>
        )}
      </div>
    </div>
    </>
  )
}
