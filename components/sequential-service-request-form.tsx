"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

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
  const [addressNumber, setAddressNumber] = useState("")
  const [addressComplement, setAddressComplement] = useState("")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [description, setDescription] = useState("")
  const [productModel, setProductModel] = useState("")

  const [preferredDate, setPreferredDate] = useState<Date | undefined>(undefined)
  const [preferredTime, setPreferredTime] = useState("")
  const [assignedProvider, setAssignedProvider] = useState<any>(null)
  const [providerLoading, setProviderLoading] = useState(false)

  const totalSteps = 7 // Updated from 6 to 7

  const handleNext = () => {
    if (step === 1 && !selectedCategory) {
      alert("Por favor, selecione uma categoria de serviço")
      return
    }
    if (step === 2 && !address) {
      alert("Por favor, confirme o endereço")
      return
    }
    if (step === 2 && !addressNumber) {
      alert("O número da casa/apartamento é obrigatório")
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
    if (step === 6 && !preferredDate) {
      alert("Por favor, escolha uma data preferencial")
      return
    }
    if (step === 6 && !preferredTime) {
      alert("Por favor, escolha um horário preferencial")
      return
    }

    if (step === 5) {
      findAvailableProvider()
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

  const findAvailableProvider = async () => {
    setProviderLoading(true)
    try {
      const supabase = createClient()

      // Find providers for this category with availability
      const { data: providers } = await supabase
        .from("service_providers")
        .select("*")
        .eq("is_active", true)
        .eq("verification_status", "verified")
        .limit(1)
        .single()

      if (providers) {
        setAssignedProvider(providers)
      }
    } catch (error) {
      console.error("[v0] Error finding provider:", error)
    } finally {
      setProviderLoading(false)
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
        service_id: selectedService || null,
        category_id: selectedCategory || null,
        service_type: selectedCategoryData?.name || "residencial",
        problem_description: description,
        product_model: productModel || null,
        address: address, // Endereço SEM número (rua apenas)
        city: profile?.city || "",
        state: profile?.state || "",
        zip_code: profile?.zip_code || "",
        notes: addressNumber
          ? `Número: ${addressNumber}${addressComplement ? ` | Complemento: ${addressComplement}` : ""} | ${description}`
          : description,
        status: "pending",
        preferred_date: preferredDate ? preferredDate.toISOString() : null,
        scheduled_date: preferredDate ? preferredDate.toISOString() : null,
      }

      // Se tem provider atribuído
      if (assignedProvider?.id) {
        requestData.provider_id = assignedProvider.id
      }

      const { data, error } = await supabase.from("service_requests").insert([requestData]).select().single()

      if (error) throw error

      router.push(`/dashboard/requests/${data.id}`)
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

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
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
              <Label htmlFor="address">Endereço (Rua, Avenida, etc.) *</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressNumber">Número *</Label>
                <Input
                  id="addressNumber"
                  value={addressNumber}
                  onChange={(e) => setAddressNumber(e.target.value)}
                  placeholder="123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressComplement">Complemento</Label>
                <Input
                  id="addressComplement"
                  value={addressComplement}
                  onChange={(e) => setAddressComplement(e.target.value)}
                  placeholder="Apto 45, Bloco B"
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Endereço completo:</p>
              <p className="text-sm">
                {address}
                {addressNumber && `, ${addressNumber}`}
                {addressComplement && `, ${addressComplement}`}
              </p>
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
                  <strong>1. Compromisso com a Qualidade:</strong> A NOW conecta você com empresas credenciadas e
                  verificadas para garantir serviços de segurança de qualidade.
                </p>

                <p>
                  <strong>2. Agendamento e Cancelamento:</strong> Após confirmar a solicitação, você receberá o contato
                  da empresa credenciada em até 24 horas. Cancelamentos devem ser feitos com pelo menos 2 horas de
                  antecedência.
                </p>

                <p>
                  <strong>3. Pagamento:</strong> O pagamento será acordado diretamente com a empresa credenciada. A NOW
                  não cobra nenhuma taxa adicional pela conexão.
                </p>

                <p>
                  <strong>4. Privacidade:</strong> Seus dados pessoais são protegidos e utilizados apenas para conectar
                  você com os prestadores de serviço.
                </p>

                <p>
                  <strong>5. Suporte:</strong> Em caso de problemas, nossa equipe está disponível para mediar e resolver
                  qualquer questão.
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

      {step === 6 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {providerLoading ? (
              <div className="text-center space-y-4 py-8">
                <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
                <h2 className="text-2xl font-bold">Buscando empresa credenciada...</h2>
                <p className="text-muted-foreground">Aguarde enquanto encontramos o melhor prestador para você</p>
              </div>
            ) : assignedProvider ? (
              <>
                <div className="text-center space-y-2 mb-4">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
                  <h2 className="text-2xl font-bold">Empresa Selecionada!</h2>
                  <p className="text-lg font-semibold">{assignedProvider.company_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Avaliação: ⭐ {assignedProvider.rating?.toFixed(1) || "5.0"} ({assignedProvider.total_reviews || 0}{" "}
                    avaliações)
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">Escolha data e horário</h3>
                  <p className="text-muted-foreground">Selecione sua preferência de atendimento</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Data Preferencial *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !preferredDate && "text-muted-foreground",
                          )}
                        >
                          {preferredDate ? format(preferredDate, "PPP", { locale: ptBR }) : "Escolha uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={preferredDate}
                          onSelect={setPreferredDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="time">Horário Preferencial *</Label>
                    <Select value={preferredTime} onValueChange={setPreferredTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Atenção:</strong> Este é o seu horário de preferência. A empresa confirmará a
                      disponibilidade e você receberá uma notificação com a confirmação final do agendamento.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-2 py-8">
                <h2 className="text-2xl font-bold">Empresa não encontrada</h2>
                <p className="text-muted-foreground">
                  Não conseguimos encontrar uma empresa credenciada no momento. Por favor, tente novamente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 7: Review & Confirmation */}
      {step === 7 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-4 py-8">
              {!isSubmitting ? (
                <>
                  <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
                  <h2 className="text-2xl font-bold">Tudo pronto!</h2>
                  <p className="text-muted-foreground">Revise suas informações e confirme a solicitação</p>

                  <div className="space-y-3 text-left bg-muted p-6 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Serviço:</p>
                      <p className="font-semibold">{selectedCategoryData?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Endereço:</p>
                      <p className="font-semibold">
                        {address}, {addressNumber}
                        {addressComplement && `, ${addressComplement}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone:</p>
                      <p className="font-semibold">{phone}</p>
                    </div>
                    {assignedProvider && (
                      <div>
                        <p className="text-sm text-muted-foreground">Empresa Selecionada:</p>
                        <p className="font-semibold">{assignedProvider.company_name}</p>
                      </div>
                    )}
                    {preferredDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Data/Horário Preferencial:</p>
                        <p className="font-semibold">
                          {format(preferredDate, "dd/MM/yyyy", { locale: ptBR })} às {preferredTime}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Descrição:</p>
                      <p className="font-semibold">{description}</p>
                    </div>
                    {productModel && (
                      <div>
                        <p className="text-sm text-muted-foreground">Produto/Modelo:</p>
                        <p className="font-semibold">{productModel}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
                  <h2 className="text-2xl font-bold">Processando sua solicitação...</h2>
                  <p className="text-muted-foreground">Aguarde enquanto finalizamos seu agendamento</p>
                </>
              )}
            </div>
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

        {step < 7 ? (
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
  )
}
