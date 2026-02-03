import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { RequestDetails } from "@/components/request-details"
import { RequestTimeline } from "@/components/request-timeline"
import { RequestChat } from "@/components/request-chat"

interface RequestDetailPageProps {
  params: Promise<{
    requestId: string
  }>
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
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

  if (!request) {
    redirect("/dashboard/requests")
  }

  // Buscar mensagens
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1">
        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-8">
              <RequestDetails request={request} />
              <RequestTimeline request={request} />
            </div>
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <RequestChat requestId={requestId} initialMessages={messages || []} currentUserId={user.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
