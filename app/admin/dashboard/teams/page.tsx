import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { TeamManagementClient } from "@/components/team-management-client"
import { redirect } from "next/navigation"

export default async function TeamsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get provider info
  const { data: provider } = await supabase
    .from("service_providers")
    .select("id, company_name, is_active")
    .eq("user_id", user.id)
    .single()

  if (!provider) {
    redirect("/admin/dashboard")
  }

  // Get team members
  const { data: teamMembers } = await supabase
    .from("provider_teams")
    .select("*")
    .eq("company_id", provider.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestão de Equipe</h1>
        <p className="text-muted-foreground">Gerencie sua equipe de técnicos e acompanhe suas atividades</p>
      </div>

      <Suspense fallback={<div>Carregando...</div>}>
        <TeamManagementClient providerId={provider.id} initialTeamMembers={teamMembers || []} />
      </Suspense>
    </div>
  )
}
