import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ServiceList } from "@/components/service-list"
import { ServiceFilters } from "@/components/service-filters"

interface ServicesPageProps {
  searchParams: Promise<{
    category?: string
    search?: string
  }>
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { category, search } = await searchParams
  const supabase = await createClient()

  // Buscar categorias em paralelo
  const [{ data: categories }, { data: categoryData }] = await Promise.all([
    supabase
      .from("service_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order"),
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
  const categoryId = isValidUUID(category) ? category : categoryData?.id

  // Buscar serviços com filtros
  let query = supabase
    .from("services")
    .select(
      `
      *,
      provider:service_providers(*),
      category:service_categories(*)
    `
    )
    .eq("is_active", true)

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%`
    )
  }

  const { data: services } = await query

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border/40 py-12 bg-background">
          <div className="container">
            <h1 className="text-4xl font-bold text-foreground">Serviços Disponíveis</h1>
            <p className="mt-2 text-muted-foreground">Encontre o serviço perfeito para sua necessidade</p>
          </div>
        </div>

        <div className="container py-12">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside>
              <ServiceFilters categories={categories || []} selectedCategory={categoryId} />
            </aside>
            <div>
              <ServiceList services={services || []} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}
