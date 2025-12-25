import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ReviewForm } from "@/components/review-form"

interface ReviewPageProps {
  params: Promise<{
    requestId: string
  }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { requestId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: request } = await supabase
    .from("service_requests")
    .select("*, service:services(*), provider:service_providers(*)")
    .eq("id", requestId)
    .eq("customer_id", user.id)
    .single()

  if (!request || request.status !== "completed") {
    redirect("/dashboard/requests")
  }

  // Verificar se já existe avaliação
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("*")
    .eq("request_id", requestId)
    .eq("customer_id", user.id)
    .single()

  if (existingReview) {
    redirect(`/dashboard/requests/${requestId}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Avaliar Serviço</h1>
              <p className="text-muted-foreground">Compartilhe sua experiência com o serviço prestado</p>
            </div>

            <ReviewForm request={request} />
          </div>
        </div>
      </main>
    </div>
  )
}
