"use client"

import { useState, useEffect } from "react"
import { User, Phone, Mail, Calendar, ArrowLeft, CheckCircle, AlertCircle, Loader2, Edit, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function ProfileInfoPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    birth_date: "",
    phone_verified: false,
  })
  const [showPhoneVerification, setShowPhoneVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)

  // Email change states
  const [showEmailChange, setShowEmailChange] = useState(false)
  const [emailChangeStep, setEmailChangeStep] = useState<'password' | 'new-email' | 'verify'>('password')
  const [currentPassword, setCurrentPassword] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [emailVerificationCode, setEmailVerificationCode] = useState("")
  const [verifyingPassword, setVerifyingPassword] = useState(false)
  const [sendingEmailCode, setSendingEmailCode] = useState(false)
  const [verifyingEmailCode, setVerifyingEmailCode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    setUser(user)

    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        phone: data.phone || "",
        birth_date: data.birth_date || "",
        phone_verified: data.phone_verified || false,
      })
    }

    setLoading(false)
  }

  const handleSendVerificationCode = async () => {
    if (!profile.phone) {
      alert("Por favor, informe seu telefone primeiro")
      return
    }

    setSendingCode(true)
    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_code',
          phone: profile.phone
        })
      })

      const data = await response.json()

      if (response.ok) {
        setShowPhoneVerification(true)
        setVerificationCode("") // Limpar campo anterior
      } else {
        alert(data.error || "Erro ao enviar código")
      }
    } catch (error) {
      console.error('Error sending verification code:', error)
      alert("Erro ao enviar código de verificação")
    } finally {
      setSendingCode(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      alert("Por favor, digite o código de verificação")
      return
    }

    setVerifyingCode(true)
    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          phone: profile.phone,
          code: verificationCode
        })
      })

      const data = await response.json()

      if (response.ok) {
        setProfile({ ...profile, phone_verified: true })
        setShowPhoneVerification(false)
        setVerificationCode("")
        // Recarregar perfil para garantir sincronização
        loadProfile()
      } else {
        alert(data.error || "Erro ao verificar código")
      }
    } catch (error) {
      console.error('Error verifying code:', error)
      alert("Erro ao verificar código")
    } finally {
      setVerifyingCode(false)
    }
  }

  const handleVerifyPassword = async () => {
    if (!currentPassword) {
      alert("Por favor, digite sua senha atual")
      return
    }

    setVerifyingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword
      })

      if (error) {
        alert("Senha incorreta. Tente novamente.")
        return
      }

      setEmailChangeStep('new-email')
    } catch (error) {
      console.error('Error verifying password:', error)
      alert("Erro ao verificar senha. Tente novamente.")
    } finally {
      setVerifyingPassword(false)
    }
  }

  const handleSendEmailVerification = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert("Por favor, digite um email válido")
      return
    }

    if (newEmail === user?.email) {
      alert("O novo email deve ser diferente do atual")
      return
    }

    setSendingEmailCode(true)
    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_code',
          newEmail: newEmail
        })
      })

      const data = await response.json()

      if (response.ok) {
        setEmailChangeStep('verify')
        setEmailVerificationCode("")
      } else {
        alert(data.error || "Erro ao enviar código")
      }
    } catch (error) {
      console.error('Error sending email verification:', error)
      alert("Erro ao enviar código de verificação")
    } finally {
      setSendingEmailCode(false)
    }
  }

  const handleVerifyEmailCode = async () => {
    if (!emailVerificationCode || emailVerificationCode.length !== 6) {
      alert("Por favor, digite o código de 6 dígitos")
      return
    }

    setVerifyingEmailCode(true)
    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          newEmail: newEmail,
          code: emailVerificationCode
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert("Email alterado com sucesso!")
        setShowEmailChange(false)
        setEmailChangeStep('password')
        setCurrentPassword("")
        setNewEmail("")
        setEmailVerificationCode("")
        // Recarregar a página para atualizar o email
        window.location.reload()
      } else {
        alert(data.error || "Erro ao verificar código")
      }
    } catch (error) {
      console.error('Error verifying email code:', error)
      alert("Erro ao verificar código")
    } finally {
      setVerifyingEmailCode(false)
    }
  }

  const resetEmailChange = () => {
    setShowEmailChange(false)
    setEmailChangeStep('password')
    setCurrentPassword("")
    setNewEmail("")
    setEmailVerificationCode("")
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id)

    if (error) {
      alert("Erro ao salvar informações")
    } else {
      alert("Informações atualizadas com sucesso!")
    }

    setSaving(false)
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
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Informações Pessoais</h1>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmailChange(true)}
                  className="h-8 px-2"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Alterar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Para alterar seu email, você precisará confirmar sua identidade
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="pl-10"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="pl-10"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="flex items-center gap-2">
                {profile.phone_verified ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Telefone verificado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Telefone não verificado</span>
                  </div>
                )}
                {!profile.phone_verified && profile.phone && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSendVerificationCode}
                    disabled={sendingCode}
                  >
                    {sendingCode ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Verificar"
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="birth_date"
                  type="date"
                  value={profile.birth_date}
                  onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </Card>

        {/* Phone Verification Dialog */}
        <Dialog open={showPhoneVerification} onOpenChange={setShowPhoneVerification}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Verificar Telefone
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Enviamos um código de 6 dígitos para
                  </p>
                  <p className="font-semibold text-foreground">{profile.phone}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code" className="text-center block">
                  Digite o código de verificação
                </Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoFocus
                />
                <p className="text-xs text-center text-muted-foreground">
                  O código expira em 10 minutos
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSendVerificationCode}
                  disabled={sendingCode}
                  className="flex-1"
                >
                  {sendingCode ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Reenviar
                    </>
                  ) : (
                    "Reenviar código"
                  )}
                </Button>
                <Button
                  onClick={handleVerifyCode}
                  disabled={verifyingCode || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {verifyingCode ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar"
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPhoneVerification(false)}
                  disabled={verifyingCode}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Email Change Dialog */}
        <Dialog open={showEmailChange} onOpenChange={resetEmailChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Alterar Email
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {emailChangeStep === 'password' && (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Para alterar seu email, primeiro confirme sua identidade
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Digite sua senha atual
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleVerifyPassword}
                      disabled={verifyingPassword || !currentPassword}
                      className="flex-1"
                    >
                      {verifyingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        "Confirmar"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetEmailChange}
                      disabled={verifyingPassword}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {emailChangeStep === 'new-email' && (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Agora digite seu novo endereço de email
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Email atual: {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-email">Novo Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="seu-novo@email.com"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSendEmailVerification}
                      disabled={sendingEmailCode || !newEmail}
                      className="flex-1"
                    >
                      {sendingEmailCode ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar Código"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEmailChangeStep('password')}
                      disabled={sendingEmailCode}
                    >
                      Voltar
                    </Button>
                  </div>
                </div>
              )}

              {emailChangeStep === 'verify' && (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Enviamos um código de 6 dígitos para
                      </p>
                      <p className="font-semibold text-foreground">{newEmail}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-verification-code" className="text-center block">
                      Digite o código de verificação
                    </Label>
                    <Input
                      id="email-verification-code"
                      value={emailVerificationCode}
                      onChange={(e) => setEmailVerificationCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-mono"
                      autoFocus
                    />
                    <p className="text-xs text-center text-muted-foreground">
                      O código expira em 10 minutos
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleVerifyEmailCode}
                      disabled={verifyingEmailCode || emailVerificationCode.length !== 6}
                      className="flex-1"
                    >
                      {verifyingEmailCode ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        "Confirmar Alteração"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEmailChangeStep('new-email')}
                      disabled={verifyingEmailCode}
                    >
                      Voltar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
