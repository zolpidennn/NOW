import { MobileHeader } from "@/components/mobile-header"
import { NavigationTabs } from "@/components/navigation-tabs"
import { ServiceGrid } from "@/components/service-grid"
import { PromoBanner } from "@/components/promo-banner"
import { ProductsCatalog } from "@/components/products-catalog"
import { RecentProviders } from "@/components/recent-providers"
import { BottomNav } from "@/components/bottom-nav"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex md:min-h-screen md:flex-col">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
          <ServiceGrid />
          <PromoBanner />
          <ProductsCatalog />
          <RecentProviders />
        </main>
        <Footer />
      </div>

      {/* Mobile */}
      <div className="flex min-h-screen flex-col bg-background pb-20 md:hidden">
        <MobileHeader />
        <NavigationTabs />
        <main className="flex-1 px-4 space-y-6">
          <ServiceGrid />
          <PromoBanner />
          <ProductsCatalog />
          <RecentProviders />
        </main>
        <BottomNav />
      </div>
    </>
  )
}
