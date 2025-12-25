import { Suspense } from "react"
import { ProductCatalog } from "@/components/product-catalog"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <main className="pb-20 pt-16">
        <Suspense fallback={<ProductCatalogSkeleton />}>
          <ProductCatalog />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  )
}

function ProductCatalogSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="h-12 bg-muted animate-pulse rounded-lg mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-muted animate-pulse rounded-lg h-80" />
        ))}
      </div>
    </div>
  )
}
