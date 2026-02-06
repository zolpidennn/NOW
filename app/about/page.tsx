import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

      <main className="pb-20 pt-[64px]">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">Sobre Nós</h1>
          <p className="text-muted-foreground">Página em desenvolvimento.</p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}