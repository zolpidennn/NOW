import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ServiceCategoryDetail } from "@/components/service-category-detail"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from("service_categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!category) {
    notFound()
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-white dark:bg-black pb-20">
=======
    <div className="min-h-screen bg-gray-50 pb-20">
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
      <MobileHeader />
      <main>
        <ServiceCategoryDetail category={category} />
      </main>
      <BottomNav />
    </div>
  )
}
