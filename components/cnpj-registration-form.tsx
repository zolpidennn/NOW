"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, AlertCircle, Building2, FileText, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCNPJ, getCNPJValidationError } from "@/lib/cnpj-validator"
import { formatCPF, getCPFValidationError } from "@/lib/cpf-validator"
import type { CNPJData } from "@/lib/brasil-api"

interface CNPJRegistrationFormProps {
  userId: string
}

type RegistrationStep = "cnpj" | "business_data" | "documents" | "review"

export function CNPJRegistrationForm({ userId }: CNPJRegistrationFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("cnpj")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // CNPJ validation data
  const [cnpj, setCnpj] = useState("")
  const [cnpjData, setCnpjData] = useState<CNPJData | null>(null)
  const [cnpjValidated, setCnpjValidated] = useState(false)

  // Business data
  const [razaoSocial, setRazaoSocial] = useState("")
  const [nomeFantasia, setNomeFantasia] = useState("")
  const [cnaePrincipal, setCnaePrincipal] = useState("")
  const [description, setDescription] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")

  // Legal representative
  const [responsavelNome, setResponsavelNome] = useState("")
  const [responsavelCPF, setResponsavelCPF] = useState("")

  // Documents
  const [documents, setDocuments] = useState<{
    contrato_social?: File
    documento_responsavel?: File
    selfie?: File
    comprovante_endereco?: File
  }>({})

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value)
    setCnpj(formatted)
    setCnpjValidated(false)
    setError(null)
  }

  const handleValidateCNPJ = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Client-side validation first
    const validationError = getCNPJValidationError(cnpj)
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/cnpj/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnpj }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Erro ao validar CNPJ")
        setIsLoading(false)
        return
      }

      if (result.warning) {
        setError(result.error)
        setCnpjData(result.data)
      } else {
        setCnpjData(result.data)
        setRazaoSocial(result.data.razao_social)
        setNomeFantasia(result.data.nome_fantasia || result.data.razao_social)
        setCnaePrincipal(result.data.cnae_fiscal)
        setEmail(result.data.email || "")
        setAddress(
          `${result.data.logradouro}, ${result.data.numero}${result.data.complemento ? " - " + result.data.complemento : ""}`,
        )
        setCity(result.data.municipio)
        setState(result.data.uf)
        setZipCode(result.data.cep)
        setPhone(result.data.ddd_telefone_1 || "")

        setCnpjValidated(true)
        setSuccess("CNPJ validado com sucesso!")

        // Automatically move to next step after 1.5s
        setTimeout(() => {
          setCurrentStep("business_data")
        }, 1500)
      }
    } catch (err) {
      setError("Erro ao validar CNPJ. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBusinessDataSubmit = () => {
    // Validate CPF
    const cpfError = getCPFValidationError(responsavelCPF)
    if (cpfError) {
      setError(cpfError)
      return
    }

    if (!responsavelNome || !phone || !email) {
      setError("Preencha todos os campos obrigatórios")
      return
    }

    setError(null)
    setCurrentStep("documents")
  }

  const handleFileChange = (type: keyof typeof documents, file: File | undefined) => {
    if (file) {
      setDocuments((prev) => ({ ...prev, [type]: file }))
    }
  }

  const handleFinalSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Create provider record
      const { data: provider, error: providerError } = await supabase
        .from("service_providers")
        .insert({
          user_id: userId,
          cnpj: cnpj.replace(/\D/g, ""),
          razao_social: razaoSocial,
          nome_fantasia: nomeFantasia,
          cnae_principal: cnaePrincipal,
          company_name: nomeFantasia,
          description,
          phone,
          email,
          address,
          city,
          state,
          zip_code: zipCode,
          responsavel_legal_nome: responsavelNome,
          responsavel_legal_cpf: responsavelCPF.replace(/\D/g, ""),
          verification_status: documents.contrato_social ? "pending_documents" : "pending",
          cnpj_validated_at: new Date().toISOString(),
          cnpj_validation_data: cnpjData,
        })
        .select()
        .single()

      if (providerError) throw providerError

      // Upload documents if any
      if (provider && Object.keys(documents).length > 0) {
        for (const [docType, file] of Object.entries(documents)) {
          if (!file) continue

          // Upload to Supabase Storage
          const fileName = `${provider.id}/${docType}_${Date.now()}_${file.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("provider-documents")
            .upload(fileName, file)

          if (uploadError) {
            console.error("[v0] Error uploading document:", uploadError)
            continue
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("provider-documents").getPublicUrl(fileName)

          // Create document record
          await supabase.from("provider_documents").insert({
            provider_id: provider.id,
            document_type: docType,
            document_url: publicUrl,
            document_name: file.name,
            file_size: file.size,
            mime_type: file.type,
          })
        }

        // Update provider status to under_review if documents were uploaded
        await supabase.from("service_providers").update({ verification_status: "under_review" }).eq("id", provider.id)
      }

      router.push("/provider/registration-success")
    } catch (err) {
      console.error("[v0] Error in provider registration:", err)
      setError(err instanceof Error ? err.message : "Erro ao cadastrar prestador")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {(["cnpj", "business_data", "documents", "review"] as const).map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 
              ${
                currentStep === step
                  ? "border-primary bg-primary text-primary-foreground"
                  : index < ["cnpj", "business_data", "documents", "review"].indexOf(currentStep)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted-foreground/30 text-muted-foreground"
              }
            `}
            >
              {index + 1}
            </div>
            {index < 3 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  index < ["cnpj", "business_data", "documents", "review"].indexOf(currentStep)
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: CNPJ Validation */}
      {currentStep === "cnpj" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Validação de CNPJ
            </CardTitle>
            <CardDescription>Digite o CNPJ da sua empresa para validação com a Receita Federal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => handleCNPJChange(e.target.value)}
                maxLength={18}
                disabled={cnpjValidated}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {cnpjValidated && cnpjData && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-semibold">{cnpjData.razao_social}</p>
                <p className="text-sm text-muted-foreground">{cnpjData.nome_fantasia}</p>
                <div className="flex gap-2">
                  <Badge variant="outline">CNAE: {cnpjData.cnae_fiscal}</Badge>
                  <Badge variant="outline">{cnpjData.situacao_cadastral}</Badge>
                </div>
              </div>
            )}

            <Button onClick={handleValidateCNPJ} className="w-full" disabled={isLoading || cnpjValidated || !cnpj}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cnpjValidated ? "CNPJ Validado" : "Validar CNPJ"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Business Data */}
      {currentStep === "business_data" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>Confirme e complete os dados da sua empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão Social</Label>
                <Input id="razaoSocial" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnaePrincipal">CNAE Principal</Label>
              <Input id="cnaePrincipal" value={cnaePrincipal} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição dos Serviços</Label>
              <Textarea
                id="description"
                placeholder="Descreva os serviços que sua empresa oferece..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-4">Responsável Legal</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="responsavelNome">Nome Completo</Label>
                  <Input
                    id="responsavelNome"
                    placeholder="Nome do responsável legal"
                    value={responsavelNome}
                    onChange={(e) => setResponsavelNome(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavelCPF">CPF</Label>
                  <Input
                    id="responsavelCPF"
                    placeholder="000.000.000-00"
                    value={responsavelCPF}
                    onChange={(e) => setResponsavelCPF(formatCPF(e.target.value))}
                    maxLength={14}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-4">Contato</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep("cnpj")} className="flex-1">
                Voltar
              </Button>
              <Button onClick={handleBusinessDataSubmit} className="flex-1">
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Documents */}
      {currentStep === "documents" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Documentos
            </CardTitle>
            <CardDescription>
              Faça upload dos documentos necessários para verificação (opcional, mas acelera a aprovação)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contrato_social">Contrato Social (Recomendado)</Label>
                <Input
                  id="contrato_social"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("contrato_social", e.target.files?.[0])}
                />
                {documents.contrato_social && (
                  <p className="text-sm text-muted-foreground">✓ {documents.contrato_social.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="documento_responsavel">Documento do Responsável (Recomendado)</Label>
                <Input
                  id="documento_responsavel"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("documento_responsavel", e.target.files?.[0])}
                />
                {documents.documento_responsavel && (
                  <p className="text-sm text-muted-foreground">✓ {documents.documento_responsavel.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="selfie">Selfie com Documento (Recomendado)</Label>
                <Input
                  id="selfie"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("selfie", e.target.files?.[0])}
                />
                {documents.selfie && <p className="text-sm text-muted-foreground">✓ {documents.selfie.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="comprovante_endereco">Comprovante de Endereço (Opcional)</Label>
                <Input
                  id="comprovante_endereco"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("comprovante_endereco", e.target.files?.[0])}
                />
                {documents.comprovante_endereco && (
                  <p className="text-sm text-muted-foreground">✓ {documents.comprovante_endereco.name}</p>
                )}
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Importante:</strong> O upload de documentos é opcional, mas acelera significativamente o
                processo de aprovação. Sem documentos, a verificação pode levar mais tempo.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep("business_data")} className="flex-1">
                Voltar
              </Button>
              <Button onClick={handleFinalSubmit} className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Finalizando..." : "Finalizar Cadastro"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
