import { createClient } from "@/lib/supabase/server"
import { ServiceCategoryCard } from "@/components/service-category-card"

export async function ServiceCategories() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("service_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  return (
    <section id="servicos" className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Serviços Disponíveis
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Escolha o serviço que você precisa e encontre o profissional ideal
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories?.map((category) => (
            <ServiceCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}
