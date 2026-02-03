import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProviderRequestDetails } from "@/components/provider-request-details"
import { RequestChat } from "@/components/request-chat"

interface ProviderRequestDetailPageProps {
  params: Promise<{
    requestId: string
  }>
}

export default async function ProviderRequestDetailPage({ params }: ProviderRequestDetailPageProps) {
  const { requestId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: provider } = await supabase.from("service_providers").select("*").eq("user_id", user.id).single()

  if (!provider) {
    redirect("/provider/register")
  }

  const { data: request } = await supabase
    .from("service_requests")
    .select("*, service:services(*), customer:customer_id(id, raw_user_meta_data)")
    .eq("id", requestId)
    .eq("provider_id", provider.id)
    .single()

  if (!request) {
    redirect("/provider")
  }

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
            <div>
              <ProviderRequestDetails request={request} providerId={provider.id} />
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
