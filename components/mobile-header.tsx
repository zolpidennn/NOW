"use client"

import { MapPin, ChevronDown, User, Navigation, Home, Briefcase, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const supabase = createClient()

export function MobileHeader() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ?? null)

      if (data.user) {
        // Load profile address
        const { data: profile } = await supabase
          .from("profiles")
          .select("address")
          .eq("id", data.user.id)
          .single()

        setAddress(profile?.address ?? null)

        // Load addresses
        const { data: addressesData } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", data.user.id)
          .order("is_primary", { ascending: false })

        if (addressesData) {
          setAddresses(addressesData)
        }
      }

      setLoading(false)
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user) {
          setAddress(null)
          setAddresses([])
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleAddressSelect = async (selectedAddress: any) => {
    if (!user) return

    // Update profile with selected address
    const fullAddress = `${selectedAddress.street}, ${selectedAddress.number} - ${selectedAddress.neighborhood}, ${selectedAddress.city} - ${selectedAddress.state}`
    await supabase.from("profiles").update({ 
      address: fullAddress,
      city: selectedAddress.city,
      state: selectedAddress.state,
      zip_code: selectedAddress.zip_code
    }).eq("id", user.id)

    // Set as primary address
    await supabase.from("addresses").update({ is_primary: false }).eq("user_id", user.id)
    await supabase.from("addresses").update({ is_primary: true }).eq("id", selectedAddress.id)

    setAddress(fullAddress)
  }

  const handleUseCurrentLocation = () => {
    router.push("/location")
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                  <MapPin className="h-4 w-4 text-primary-foreground" />
                </div>

                <div className="text-left min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Localização</p>

                  <p className="flex items-center gap-1 text-sm font-semibold truncate">
                    {loading
                      ? "Carregando..."
                      : address || "Escolha seu endereço"}
                    <ChevronDown className="h-3 w-3 flex-shrink-0" />
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                Endereços Salvos
              </div>
              {addresses.length > 0 ? (
                addresses.map((addr) => (
                  <DropdownMenuItem
                    key={addr.id}
                    onClick={() => handleAddressSelect(addr)}
                    className="flex items-start gap-3 p-3"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      {addr.label === "Casa" && <Home className="h-4 w-4" />}
                      {addr.label === "Trabalho" && <Briefcase className="h-4 w-4" />}
                      {addr.label === "Principal" && <Building2 className="h-4 w-4" />}
                      {!["Casa", "Trabalho", "Principal"].includes(addr.label) && <MapPin className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {addr.label}
                        </span>
                        {addr.is_primary && (
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {addr.street}, {addr.number} - {addr.neighborhood}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {addr.city}, {addr.state}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Nenhum endereço salvo
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleUseCurrentLocation} className="flex items-center gap-3 p-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                  <Navigation className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Usar localização atual</p>
                  <p className="text-xs text-muted-foreground">Detectar meu endereço</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={() => router.push("/auth/login")}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>

            <div className="text-left min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Localização</p>
              <p className="flex items-center gap-1 text-sm font-semibold truncate">
                Faça login para continuar
                <ChevronDown className="h-3 w-3 flex-shrink-0" />
              </p>
            </div>
          </button>
        )}

        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link href={user ? "/profile" : "/auth/login"}>
            <User className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
