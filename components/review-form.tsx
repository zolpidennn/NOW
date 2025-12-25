"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { ServiceRequest, Service, ServiceProvider } from "@/lib/types"
import { Star } from "lucide-react"

interface RequestWithRelations extends ServiceRequest {
  service: Service
  provider: ServiceProvider
}

interface ReviewFormProps {
  request: RequestWithRelations
}

export function ReviewForm({ request }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (rating === 0) {
      setError("Por favor, selecione uma avaliação")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      const { error: insertError } = await supabase.from("reviews").insert({
        request_id: request.id,
        customer_id: user.id,
        provider_id: request.provider_id,
        rating,
        comment: comment.trim() || null,
      })

      if (insertError) throw insertError

      router.push(`/dashboard/requests/${request.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar avaliação")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliação do Serviço</CardTitle>
        <CardDescription>
          {request.service.name} - {request.provider.company_name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Sua Avaliação</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoverRating || rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && "Muito insatisfeito"}
                {rating === 2 && "Insatisfeito"}
                {rating === 3 && "Neutro"}
                {rating === 4 && "Satisfeito"}
                {rating === 5 && "Muito satisfeito"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comentário (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Conte-nos sobre sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading || rating === 0}>
            {isLoading ? "Enviando avaliação..." : "Enviar Avaliação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
