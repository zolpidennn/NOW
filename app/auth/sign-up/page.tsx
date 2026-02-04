"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Shield, ArrowLeft, ArrowRight } from "lucide-react"

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const totalSteps = 3

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15)
  }

  const handleNext = () => {
    setError(null)

    if (step === 1 && !fullName) {
      setError("Por favor, informe seu nome completo")
      return
    }

    if (step === 2) {
      if (!phone) {
        setError("Por favor, informe seu telefone")
        return
      }
      if (!email) {
        setError("Por favor, informe seu email")
        return
      }
    }

    setStep(step + 1)
  }

  const handleSignUp = async () => {
    setError(null)

    if (!password || !repeatPassword) {
      setError("Por favor, preencha os campos de senha")
      return
    }

    if (password !== repeatPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres")
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      })
      if (error) throw error
      router.push("/auth/verify-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
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
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-2xl">Criar Conta</CardTitle>
              <span className="text-sm text-muted-foreground">
                Passo {step} de {totalSteps}
              </span>
            </div>
            <CardDescription>Cadastro rápido e seguro</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress bar */}
            <div className="mb-6 flex gap-1">
              {[...Array(totalSteps)].map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-border"}`} />
              ))}
            </div>

            {/* Step 1: Full Name */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="João Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Phone & Email */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Usaremos este número para entrar em contato sobre seus serviços
                  </p>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="repeatPassword">Confirmar Senha</Label>
                  <Input
                    id="repeatPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold">Resumo do cadastro:</p>
                  <p>
                    <span className="text-muted-foreground">Nome:</span> {fullName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span> {email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Telefone:</span> {phone}
                  </p>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Navigation buttons */}
            <div className="flex gap-2 mt-6">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}

              {step < totalSteps ? (
                <Button type="button" onClick={handleNext} className="flex-1">
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSignUp} className="flex-1" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              )}
            </div>

            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
