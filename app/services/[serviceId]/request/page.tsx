import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ServiceRequestForm } from "@/components/service-request-form"
import { redirect } from "next/navigation"

interface ServiceRequestPageProps {
  params: Promise<{
    serviceId: string
  }>
}

export default async function ServiceRequestPage({ params }: ServiceRequestPageProps) {
  const { serviceId } = await params
  const supabase = await createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/services/${serviceId}/request`)
  }

  // Buscar dados do serviço
  const { data: service } = await supabase
    .from("services")
    .select(
      `
      *,
      provider:service_providers(*),
      category:service_categories(*)
    `,
    )
    .eq("id", serviceId)
    .single()

  if (!service) {
    redirect("/services")
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border/40 py-12">
          <div className="container">
            <h1 className="text-4xl font-bold">Solicitar Serviço</h1>
            <p className="mt-2 text-muted-foreground">Preencha os dados para solicitar o serviço</p>
          </div>
        </div>

        <div className="container py-12">
          <div className="mx-auto max-w-3xl">
            <ServiceRequestForm service={service} profile={profile} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
