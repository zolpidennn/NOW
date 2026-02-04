import { Suspense } from "react"
import { ProductDetails } from "@/components/product-details"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"

export default function ProductDetailPage({
  params,
}: {
  params: { productId: string }
}) {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

      <main className="pb-20 pt-[64px]">
        <Suspense fallback={<ProductDetailsSkeleton />}>
          <ProductDetails productId={params.productId} />
        </Suspense>
      </main>

      <BottomNav />
    </div>
  )
}

function ProductDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-muted animate-pulse rounded-lg aspect-square" />
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-12 bg-muted animate-pulse rounded" />
          <div className="h-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
