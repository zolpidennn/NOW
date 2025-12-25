import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { RequestsList } from "@/components/requests-list"

export default async function RequestsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: requests } = await supabase
    .from("service_requests")
    .select("*, service:services(*), provider:service_providers(*)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Minhas Solicitações</h1>
            <p className="text-muted-foreground">Acompanhe todas as suas solicitações de serviço</p>
          </div>

          <RequestsList requests={requests || []} />
        </div>
      </main>
    </div>
  )
}
