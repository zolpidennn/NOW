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

  // Check if user is a direct provider or team member
  let provider = null
  let isTeamMember = false
  let companyId = null

  // First, check if user is a direct provider
  const { data: directProvider } = await supabase
    .from("service_providers")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (directProvider) {
    provider = directProvider
  } else {
    // Check if user is a team member
    const { data: teamMember } = await supabase
      .from("provider_teams")
      .select(`
        *,
        company:company_id (
          id,
          company_name,
          individual_name,
          verification_status,
          is_active
        )
      `)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single()

    if (teamMember?.company) {
      provider = teamMember.company
      isTeamMember = true
      companyId = teamMember.company_id
    }
  }

  if (!provider) {
    redirect("/provider/register")
  }

  // Check verification status
  if (provider.verification_status !== "verified") {
    redirect("/provider/registration-success")
  }

  // Fetch provider stats
  const providerId = isTeamMember ? companyId : provider.id

  const [productsResult, requestsResult] = await Promise.all([
    supabase.from("provider_products").select("*", { count: "exact" }).eq("provider_id", providerId),
    supabase.from("service_requests").select("id", { count: "exact" }).eq("provider_id", providerId),
  ])

  // Get request IDs for the provider
  const requestIds = requestsResult.data?.map(r => r.id) || []

  // Count unread messages from customers
  const { count: unreadMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .in("request_id", requestIds)
    .eq("is_read", false)
    .neq("sender_id", user.id)

  const stats = {
    totalProducts: productsResult.count || 0,
    publishedProducts: productsResult.data?.filter((p) => p.status === "approved").length || 0,
    pendingProducts: productsResult.data?.filter((p) => p.status === "pending_review").length || 0,
    totalAppointments: requestsResult.count || 0,
    unreadMessages: unreadMessages || 0,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Painel do Prestador</h1>
            <p className="text-muted-foreground">
              {provider.company_name || provider.individual_name} - Gerencie produtos, serviços e atendimentos
              {isTeamMember && <span className="text-primary font-medium"> (Membro da Equipe)</span>}
            </p>
          </div>

          <ProviderDashboardTabs
            provider={provider}
            stats={stats}
            providerId={providerId}
            isTeamMember={isTeamMember}
          />
        </div>
      </main>
    </div>
  )
}
