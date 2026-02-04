"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCPF, isValidCPF } from "@/lib/cpf-validator"
import { CheckCircle2, AlertCircle, User, FileText, Shield } from "lucide-react"

const AREAS_ATUACAO = [
  "Vigilância Patrimonial",
  "Segurança Pessoal",
  "Portaria/Recepção",
  "Vigilância Eletrônica",
  "Escolta Armada",
  "Segurança de Eventos",
  "Investigação Particular",
  "Consultoria em Segurança",
]

export function PFRegistrationForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Personal data
  const [nomeCompleto, setNomeCompleto] = useState("")
  const [cpf, setCpf] = useState("")
  const [cpfValidated, setCpfValidated] = useState(false)
  const [dataNascimento, setDataNascimento] = useState("")
  const [rg, setRg] = useState("")
  const [telefone, setTelefone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [endereco, setEndereco] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")

  // Professional data
  const [areasAtuacao, setAreasAtuacao] = useState<string[]>([])
  const [experiencia, setExperiencia] = useState("")

  // Documents
  const [rgFile, setRgFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfieComDocumentoFile, setSelfieComDocumentoFile] = useState<File | null>(null)

  // Terms
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptResponsibility, setAcceptResponsibility] = useState(false)
  const [acceptLGPD, setAcceptLGPD] = useState(false)

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15)
  }

  const handleValidateCPF = async () => {
    setError(null)
    setSuccess(null)

    if (!isValidCPF(cpf)) {
      setError("CPF inválido. Verifique os dígitos.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/cpf/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao validar CPF")
      }

      setCpfValidated(true)
      setSuccess("CPF validado com sucesso!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao validar CPF")
      setCpfValidated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "rg" | "selfie" | "selfie_documento") => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Arquivo muito grande. Máximo 5MB.")
        return
      }
      if (type === "rg") setRgFile(file)
      if (type === "selfie") setSelfieFile(file)
      if (type === "selfie_documento") setSelfieComDocumentoFile(file)
    }
  }

  const uploadDocument = async (file: File, providerId: string, documentType: string) => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${providerId}/${documentType}_${Date.now()}.${fileExt}`

    const { error: uploadError, data } = await supabase.storage.from("provider-documents").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from("provider-documents").getPublicUrl(fileName)

    // Record in database
    await supabase.from("provider_documents").insert({
      provider_id: providerId,
      document_type: documentType,
      document_url: publicUrl,
      document_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })

    return publicUrl
  }

  const handleSubmitStep1 = () => {
    setError(null)

    if (!nomeCompleto || !cpf || !dataNascimento || !rg) {
      setError("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (!cpfValidated) {
      setError("Por favor, valide seu CPF antes de continuar")
      return
    }

    setStep(2)
  }

  const handleSubmitStep2 = () => {
    setError(null)

    if (!telefone || !cidade || !estado) {
      setError("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (areasAtuacao.length === 0) {
      setError("Selecione pelo menos uma área de atuação")
      return
    }

    setStep(3)
  }

  const handleSubmitStep3 = async () => {
    setError(null)

    if (!rgFile || !selfieComDocumentoFile) {
      setError("Por favor, envie todos os documentos obrigatórios")
      return
    }

    if (!acceptTerms || !acceptResponsibility || !acceptLGPD) {
      setError("Você deve aceitar todos os termos para continuar")
      return
    }

    setIsLoading(true)

    try {
      // Create service provider record
      const { data: provider, error: providerError } = await supabase
        .from("service_providers")
        .insert({
          user_id: userId,
          provider_type: "PF",
          company_name: nomeCompleto,
          cpf: cpf.replace(/\D/g, ""),
          data_nascimento: dataNascimento,
          rg,
          contact_phone: telefone,
          whatsapp: whatsapp || telefone,
          address: endereco,
          city: cidade,
          state: estado,
          areas_atuacao: areasAtuacao,
          experiencia,
          verification_status: "pending_identity",
          is_active: false,
        })
        .select()
        .single()

      if (providerError) throw providerError

      // Upload documents
      await uploadDocument(rgFile, provider.id, "rg")
      if (selfieFile) await uploadDocument(selfieFile, provider.id, "selfie")
      await uploadDocument(selfieComDocumentoFile, provider.id, "selfie_com_documento")

      router.push("/provider/registration-success?type=pf")
    } catch (err) {
      console.error("[v0] Registration error:", err)
      setError(err instanceof Error ? err.message : "Erro ao completar cadastro")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                step >= s ? "border-primary bg-primary text-primary-foreground" : "border-muted"
              }`}
            >
              {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            {s < 3 && <div className={`h-0.5 w-16 ${step > s ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Personal Data */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>Informações básicas e documento de identificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nomeCompleto">
                Nome Completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nomeCompleto"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cpf">
                  CPF <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => {
                      setCpf(formatCPF(e.target.value))
                      setCpfValidated(false)
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  <Button onClick={handleValidateCPF} disabled={isLoading || cpfValidated} variant="outline">
                    {cpfValidated ? <CheckCircle2 className="h-4 w-4" /> : "Validar"}
                  </Button>
                </div>
                {cpfValidated && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> CPF validado
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="dataNascimento">
                  Data de Nascimento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rg">
                RG <span className="text-destructive">*</span>
              </Label>
              <Input id="rg" value={rg} onChange={(e) => setRg(e.target.value)} placeholder="Número do RG" />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleSubmitStep1} className="w-full">
              Próximo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Professional Data */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Dados Profissionais
            </CardTitle>
            <CardDescription>Contato e áreas de atuação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="telefone">
                  Telefone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                />
                <p className="text-xs text-muted-foreground mt-1">Se diferente do telefone</p>
              </div>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, bairro"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cidade">
                  Cidade <span className="text-destructive">*</span>
                </Label>
                <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" />
              </div>

              <div>
                <Label htmlFor="estado">
                  Estado <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label>
                Áreas de Atuação <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {AREAS_ATUACAO.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={areasAtuacao.includes(area)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAreasAtuacao([...areasAtuacao, area])
                        } else {
                          setAreasAtuacao(areasAtuacao.filter((a) => a !== area))
                        }
                      }}
                    />
                    <Label htmlFor={area} className="text-sm font-normal cursor-pointer">
                      {area}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="experiencia">Experiência (Opcional)</Label>
              <Textarea
                id="experiencia"
                value={experiencia}
                onChange={(e) => setExperiencia(e.target.value)}
                placeholder="Descreva sua experiência na área de segurança..."
                rows={4}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Voltar
              </Button>
              <Button onClick={handleSubmitStep2} className="flex-1">
                Próximo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Documents and Terms */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos e Termos
            </CardTitle>
            <CardDescription>Comprovação de identidade e aceite dos termos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Para sua segurança e dos clientes, precisamos verificar sua identidade. Os documentos são armazenados de
                forma criptografada conforme LGPD.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="rgFile">
                  Foto do RG ou CNH <span className="text-destructive">*</span>
                </Label>
                <div className="mt-2">
                  <Input
                    id="rgFile"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "rg")}
                    className="cursor-pointer"
                  />
                  {rgFile && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {rgFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="selfieFile">Selfie (Opcional)</Label>
                <div className="mt-2">
                  <Input
                    id="selfieFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "selfie")}
                    className="cursor-pointer"
                  />
                  {selfieFile && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {selfieFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="selfieDocFile">
                  Selfie segurando o documento <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Tire uma foto sua segurando o documento ao lado do rosto
                </p>
                <Input
                  id="selfieDocFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "selfie_documento")}
                  className="cursor-pointer"
                />
                {selfieComDocumentoFile && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {selfieComDocumentoFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 bg-muted p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(c) => setAcceptTerms(c as boolean)} />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                  Aceito os Termos de Uso e Política de Privacidade da plataforma
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="responsibility"
                  checked={acceptResponsibility}
                  onCheckedChange={(c) => setAcceptResponsibility(c as boolean)}
                />
                <Label htmlFor="responsibility" className="text-sm font-normal cursor-pointer leading-relaxed">
                  Declaro que sou responsável pelos serviços prestados e pelos eventuais danos causados no exercício da
                  atividade
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="lgpd" checked={acceptLGPD} onCheckedChange={(c) => setAcceptLGPD(c as boolean)} />
                <Label htmlFor="lgpd" className="text-sm font-normal cursor-pointer leading-relaxed">
                  Autorizo o tratamento dos meus dados pessoais conforme a LGPD, incluindo CPF e documentos de
                  identificação
                </Label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1" disabled={isLoading}>
                Voltar
              </Button>
              <Button onClick={handleSubmitStep3} className="flex-1" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Concluir Cadastro"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
