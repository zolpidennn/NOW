import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProviderDashboardTabs } from "@/components/provider-dashboard-tabs"

export default async function ProviderDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is a provider
  const { data: provider } = await supabase.from("service_providers").select("*").eq("user_id", user.id).single()

  if (!provider) {
    redirect("/provider/register")
  }

  // Check verification status
  if (provider.verification_status !== "verified") {
    redirect("/provider/registration-success")
  }

  // Fetch provider stats
  const [productsResult, appointmentsResult, messagesResult] = await Promise.all([
    supabase.from("provider_products").select("*", { count: "exact" }).eq("provider_id", provider.id),
    supabase.from("provider_appointments").select("*", { count: "exact" }).eq("provider_id", provider.id),
    supabase.from("provider_chats").select("*", { count: "exact" }).eq("provider_id", provider.id).eq("is_read", false),
  ])

  const stats = {
    totalProducts: productsResult.count || 0,
    publishedProducts: productsResult.data?.filter((p) => p.status === "approved").length || 0,
    pendingProducts: productsResult.data?.filter((p) => p.status === "pending_review").length || 0,
    totalAppointments: appointmentsResult.count || 0,
    unreadMessages: messagesResult.count || 0,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Painel do Prestador</h1>
            <p className="text-muted-foreground">
              {provider.company_name || provider.nome_completo} - Gerencie produtos, serviços e atendimentos
            </p>
          </div>

          <ProviderDashboardTabs provider={provider} stats={stats} />
        </div>
      </main>
    </div>
  )
}
