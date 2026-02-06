import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProviderStats } from "@/components/provider-stats"
import { ProviderRequests } from "@/components/provider-requests"

export default async function ProviderDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Buscar dados do prestador
  const { data: provider } = await supabase.from("service_providers").select("*").eq("user_id", user.id).single()

  if (!provider) {
    redirect("/provider/register")
  }

  // Buscar solicitações
  const { data: requests, count: totalRequests } = await supabase
    .from("service_requests")
    .select("*, service:services(*), customer:customer_id(id, raw_user_meta_data)", { count: "exact" })
    .eq("provider_id", provider.id)
    .order("created_at", { ascending: false })

  const pendingCount = requests?.filter((r) => r.status === "pending").length || 0
  const scheduledCount = requests?.filter((r) => r.status === "scheduled").length || 0
  const completedCount = requests?.filter((r) => r.status === "completed").length || 0

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Painel do Prestador</h1>
            <p className="text-muted-foreground">Gerencie suas solicitações e serviços</p>
          </div>

          <ProviderStats
            total={totalRequests || 0}
            pending={pendingCount}
            scheduled={scheduledCount}
            completed={completedCount}
            rating={provider.rating}
            totalReviews={provider.total_reviews}
          />

          <div className="mt-8">
            <ProviderRequests requests={requests || []} providerId={provider.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
