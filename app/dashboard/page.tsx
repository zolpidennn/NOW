import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { RequestsOverview } from "@/components/requests-overview"
import { RecentRequests } from "@/components/recent-requests"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Buscar perfil
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Buscar estatísticas de solicitações
  const { data: requests, count: totalRequests } = await supabase
    .from("service_requests")
    .select("*, service:services(*), provider:service_providers(*)", { count: "exact" })
    .eq("customer_id", user.id)
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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo de volta, {profile?.full_name || user.email}</p>
          </div>

          <RequestsOverview
            total={totalRequests || 0}
            pending={pendingCount}
            scheduled={scheduledCount}
            completed={completedCount}
          />

          <div className="mt-8">
            <RecentRequests requests={requests || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
