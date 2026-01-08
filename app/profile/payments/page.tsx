"use client"

import { CreditCard, ArrowLeft, Plus, Trash2, Check, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { CardBrandIcon } from "@/components/card-brand-icon"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PaymentCard {
  id: string
  card_number_last4: string
  card_brand: string
  card_holder_name: string
  expiration_month: number
  expiration_year: number
  is_default: boolean
  is_active: boolean
  validation_status: string
}

export default function PaymentsPage() {
  const [cards, setCards] = useState<PaymentCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()

  // Form state
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolderName, setCardHolderName] = useState("")
  const [expirationMonth, setExpirationMonth] = useState("")
  const [expirationYear, setExpirationYear] = useState("")
  const [cvv, setCvv] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data, error } = await supabase
      .from("payment_cards")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao carregar cartões:", error)
    } else {
      setCards(data || [])
    }
    setIsLoading(false)
  }

  const getCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, "")
    if (/^4/.test(cleaned)) return "visa"
    if (/^5[1-5]/.test(cleaned)) return "mastercard"
    if (/^3[47]/.test(cleaned)) return "amex"
    if (/^6(?:011|5)/.test(cleaned)) return "discover"
    return "unknown"
  }

  const validateCardNumber = (number: string): boolean => {
    // Algoritmo de Luhn
    const cleaned = number.replace(/\s/g, "")
    if (!/^\d{13,19}$/.test(cleaned)) return false

    let sum = 0
    let isEven = false

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  const validateCVV = (cvv: string, brand: string): boolean => {
    const cleaned = cvv.replace(/\s/g, "")
    if (brand === "amex") {
      return /^\d{4}$/.test(cleaned)
    }
    return /^\d{3}$/.test(cleaned)
  }

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, "")
    const chunks = cleaned.match(/.{1,4}/g)
    return chunks ? chunks.join(" ") : cleaned
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("Você precisa estar logado para adicionar um cartão")
      setIsSubmitting(false)
      return
    }

    // Validações
    const cleanedCardNumber = cardNumber.replace(/\s/g, "")
    const brand = getCardBrand(cleanedCardNumber)

    if (!validateCardNumber(cleanedCardNumber)) {
      setError("Número do cartão inválido")
      setIsSubmitting(false)
      return
    }

    if (!validateCVV(cvv, brand)) {
      setError("CVV inválido")
      setIsSubmitting(false)
      return
    }

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const expYear = parseInt(expirationYear)
    const expMonth = parseInt(expirationMonth)

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      setError("Cartão expirado")
      setIsSubmitting(false)
      return
    }

    // Salvar cartão (apenas últimos 4 dígitos)
    const last4 = cleanedCardNumber.slice(-4)
    const isFirstCard = cards.length === 0

    const { error: insertError } = await supabase.from("payment_cards").insert({
      user_id: user.id,
      card_number_last4: last4,
      card_brand: brand,
      card_holder_name: cardHolderName.trim(),
      expiration_month: expMonth,
      expiration_year: expYear,
      is_default: isFirstCard,
      validation_status: "valid", // Será validado pela API bancária no futuro
    })

    if (insertError) {
      setError("Erro ao salvar cartão. Tente novamente.")
      console.error(insertError)
    } else {
      setIsDialogOpen(false)
      resetForm()
      loadCards()
    }

    setIsSubmitting(false)
  }

  const resetForm = () => {
    setCardNumber("")
    setCardHolderName("")
    setExpirationMonth("")
    setExpirationYear("")
    setCvv("")
    setError(null)
  }

  const handleSetDefault = async (cardId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Primeiro, remover padrão de todos os cartões
    await supabase
      .from("payment_cards")
      .update({ is_default: false })
      .eq("user_id", user.id)

    // Depois, definir o cartão selecionado como padrão
    const { error } = await supabase
      .from("payment_cards")
      .update({ is_default: true })
      .eq("id", cardId)
      .eq("user_id", user.id)

    if (!error) {
      loadCards()
    }
  }

  const handleDelete = async (cardId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from("payment_cards")
      .update({ is_active: false })
      .eq("id", cardId)
      .eq("user_id", user.id)

    if (!error) {
      loadCards()
      setIsDeleting(null)
    }
  }

  const getBrandName = (brand: string): string => {
    const brands: Record<string, string> = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
      unknown: "Cartão",
    }
    return brands[brand] || "Cartão"
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i)

  return (
    <div className="page-transition flex min-h-screen flex-col bg-background pb-20">
      <MobileHeader />
      <main className="flex-1 px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Formas de Pagamento</h1>
          </div>

          {isLoading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Carregando...</p>
            </Card>
          ) : (
            <>
              <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Cartão
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Adicionar Cartão</DialogTitle>
                      <DialogDescription>
                        Adicione um cartão de crédito ou débito para facilitar seus pagamentos.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                              const formatted = formatCardNumber(e.target.value.replace(/\D/g, ""))
                              setCardNumber(formatted)
                            }}
                            required
                            className="pr-12"
                          />
                          {cardNumber && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <CardBrandIcon brand={getCardBrand(cardNumber.replace(/\s/g, ""))} className="h-6 w-8" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardHolderName">Nome no Cartão</Label>
                        <Input
                          id="cardHolderName"
                          type="text"
                          placeholder="Nome como está no cartão"
                          value={cardHolderName}
                          onChange={(e) => setCardHolderName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expirationMonth">Mês</Label>
                          <Select value={expirationMonth} onValueChange={setExpirationMonth} required>
                            <SelectTrigger id="expirationMonth">
                              <SelectValue placeholder="Mês" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map((month) => (
                                <SelectItem key={month} value={month.toString()}>
                                  {month.toString().padStart(2, "0")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expirationYear">Ano</Label>
                          <Select value={expirationYear} onValueChange={setExpirationYear} required>
                            <SelectTrigger id="expirationYear">
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="text"
                            placeholder="123"
                            maxLength={4}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                            required
                          />
                        </div>
                      </div>

                      {error && <p className="text-sm text-destructive">{error}</p>}

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setIsDialogOpen(false)
                            resetForm()
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                          {isSubmitting ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {cards.length === 0 ? (
                <Card className="p-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">Nenhum cartão cadastrado</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adicione um cartão para facilitar seus pagamentos
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {cards.map((card) => (
                    <Card key={card.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CardBrandIcon brand={card.card_brand} className="h-10 w-14" />
                            <div>
                              <CardTitle className="text-lg">
                                {getBrandName(card.card_brand)} •••• {card.card_number_last4}
                              </CardTitle>
                              <CardDescription>
                                {card.card_holder_name} • Expira em{" "}
                                {card.expiration_month.toString().padStart(2, "0")}/
                                {card.expiration_year}
                              </CardDescription>
                            </div>
                          </div>
                          {card.is_default && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Padrão
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          {!card.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(card.id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Definir como Padrão
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeleting(card.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          <AlertDialog open={isDeleting !== null} onOpenChange={() => setIsDeleting(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover cartão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover este cartão? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => isDeleting && handleDelete(isDeleting)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
