import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SequentialServiceRequestForm } from "@/components/sequential-service-request-form"
import { redirect } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"

interface ServiceRequestPageProps {
  searchParams: Promise<{
    category?: string
  }>
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default async function ServiceRequestPage({ searchParams }: ServiceRequestPageProps) {
  const { category } = await searchParams
  const supabase = await createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const redirectUrl = category ? `/services/request?category=${category}` : "/services/request"
    redirect(`/auth/login?redirect=${redirectUrl}`)
  }

  // Buscar dados em paralelo
  const [
    { data: profile },
    { data: categories },
    categoryIdResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("service_categories")
      .select("*")
      .eq("is_active", true)
      .order("name"),
    // Buscar categoria por slug se fornecida e não for UUID
    category && !isValidUUID(category)
      ? supabase
          .from("service_categories")
          .select("id")
          .eq("slug", category)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  // Determinar categoryId
  const categoryId = isValidUUID(category) ? category : categoryIdResult?.data?.id

  // Buscar serviços da categoria se fornecida
  let services = null
  if (categoryId) {
    const { data } = await supabase
      .from("services")
      .select(
        `
        *,
        provider:service_providers(*),
        category:service_categories(*)
      `
      )
      .eq("is_active", true)
      .eq("category_id", categoryId)

    services = data
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex md:min-h-screen md:flex-col">
        <Header />
        <main className="flex-1">
          <div className="border-b border-border/40 py-12">
            <div className="container">
              <h1 className="text-4xl font-bold">Solicitar Serviço</h1>
              <p className="mt-2 text-muted-foreground">Siga os passos para solicitar seu serviço</p>
            </div>
          </div>

          <div className="container py-12">
            <div className="mx-auto max-w-3xl">
              <SequentialServiceRequestForm
                profile={profile}
                categories={categories || []}
                services={services || []}
                preSelectedCategory={category}
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Mobile */}
      <div className="flex min-h-screen flex-col md:hidden">
        <MobileHeader />
        <main className="flex-1 pb-20">
          <div className="border-b border-border/40 bg-card px-4 py-6">
            <h1 className="text-2xl font-bold">Solicitar Serviço</h1>
            <p className="mt-1 text-sm text-muted-foreground">Siga os passos abaixo</p>
          </div>

          <div className="p-4">
            <SequentialServiceRequestForm
              profile={profile}
              categories={categories || []}
              services={services || []}
              preSelectedCategory={category}
            />
          </div>
        </main>
        <BottomNav />
      </div>
    </>
  )
}
