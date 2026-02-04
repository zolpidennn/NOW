"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, User, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function CompleteProfilePage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      router.push("/auth/login")
      return
    }

    setEmail(user.email || "")

    // Tentar obter o nome do perfil ou dos metadados
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

    if (profile?.full_name && profile.full_name !== "Usuário") {
      setFullName(profile.full_name)
    } else {
      // Tentar obter dos metadados do Google
      const nameFromGoogle =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        `${user.user_metadata?.given_name || ""} ${user.user_metadata?.family_name || ""}`.trim()

      if (nameFromGoogle && nameFromGoogle !== "Usuário") {
        setFullName(nameFromGoogle)
      }
    }

    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError("Por favor, informe seu nome completo")
      return
    }

    if (fullName.trim().length < 3) {
      setError("O nome deve ter pelo menos 3 caracteres")
      return
    }

    setIsSaving(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("Sessão expirada. Por favor, faça login novamente.")
      setIsSaving(false)
      router.push("/auth/login")
      return
    }

    // Atualizar ou criar o perfil
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: fullName.trim(),
        },
        {
          onConflict: "id",
        }
      )

    if (profileError) {
      setError("Erro ao salvar perfil. Tente novamente.")
      console.error(profileError)
      setIsSaving(false)
      return
    }

    // Redirecionar para a home após salvar
    router.push("/")
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8" />
            <span className="text-2xl font-bold">NOW</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Complete seu Perfil</CardTitle>
            <CardDescription>Confirme seu nome completo para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{email}</span>
                </div>
                <p className="text-xs text-muted-foreground">Email conectado via Google</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Nome Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="João Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isSaving}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Este nome será usado em seu perfil e pedidos
                </p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Continuar"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Ao continuar, você concorda com nossos{" "}
                <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
                  Termos de Uso
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
