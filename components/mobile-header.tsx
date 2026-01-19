"use client"

import { MapPin, ChevronDown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const supabase = createClient()

export function MobileHeader() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ?? null)

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("address")
          .eq("id", data.user.id)
          .single()

        setAddress(profile?.address ?? null)
      }

      setLoading(false)
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user) {
          setAddress(null)
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLocationClick = () => {
    router.push(user ? "/location" : "/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <button
          onClick={handleLocationClick}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
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

        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link href={user ? "/profile" : "/auth/login"}>
            <User className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
