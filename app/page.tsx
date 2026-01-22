"use client"

import { MobileHeader } from "@/components/mobile-header"
import { NavigationTabs } from "@/components/navigation-tabs"
import { ServiceGrid } from "@/components/service-grid"
import { PromoBanner } from "@/components/promo-banner"
import { ProductsCatalog } from "@/components/products-catalog"
import { BottomNav } from "@/components/bottom-nav"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"

// Seeded random number generator to ensure server and client generate the same values
function mulberry32(a: number) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário já viu o onboarding (apenas no mobile)
    const checkOnboarding = () => {
      try {
        // Verificar se é mobile (largura da tela < 768px)
        const isMobile = window.innerWidth < 768
        const onboardingCompleted = localStorage.getItem('onboarding_completed')
        const hasSeenOnboarding = onboardingCompleted === 'true'

        if (!hasSeenOnboarding && isMobile) {
          router.push('/onboarding')
          return
        }

        setMounted(true)
      } catch (error) {
        // Em caso de erro, mostrar a página normalmente
        setMounted(true)
      } finally {
        setIsChecking(false)
      }
    }

    checkOnboarding()
  }, [router])

  // Loading screen enquanto verifica onboarding
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">NOW</h2>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  // Generate particle data with fixed seeds for consistent server/client rendering
  const desktopRand = mulberry32(12345)
  const desktopParticles = [...Array(20)].map(() => ({
    left: desktopRand() * 100,
    top: desktopRand() * 100,
    delay: desktopRand() * 5,
    duration: 10 + desktopRand() * 10,
  }))

  const mobileRand = mulberry32(67890)
  const mobileParticles = [...Array(15)].map(() => ({
    left: mobileRand() * 100,
    top: mobileRand() * 100,
    delay: mobileRand() * 5,
    duration: 10 + mobileRand() * 10,
  }))

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex md:min-h-screen md:flex-col relative overflow-hidden">
        {/* Background com efeito de nuvem animado */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-background"></div>
          
          {/* Nuvens animadas */}
          <div className="absolute top-20 left-10 w-72 h-32 bg-white/10 rounded-full blur-3xl animate-pulse-slow opacity-60"></div>
          <div className="absolute top-40 right-20 w-96 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse-slow opacity-50 animation-delay-2000"></div>
          <div className="absolute bottom-40 left-1/4 w-80 h-36 bg-primary/5 rounded-full blur-3xl animate-pulse-slow opacity-70 animation-delay-4000"></div>
          
          {/* Partículas flutuantes */}
          {desktopParticles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>

        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
          <div
            className={`space-y-8 transition-all duration-1000 ease-out ${
              mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
            }`}
          >
            <ServiceGrid />
            <PromoBanner />
            <ProductsCatalog />
          </div>
        </main>
        <Footer />
      </div>

      {/* Mobile */}
      <div className="flex min-h-screen flex-col bg-background pb-20 md:hidden relative overflow-hidden">
        {/* Background com efeito de nuvem animado */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-background"></div>
          
          {/* Nuvens animadas */}
          <div className="absolute top-20 left-5 w-48 h-24 bg-white/10 rounded-full blur-2xl animate-pulse-slow opacity-60"></div>
          <div className="absolute top-32 right-5 w-56 h-28 bg-primary/10 rounded-full blur-2xl animate-pulse-slow opacity-50 animation-delay-2000"></div>
          <div className="absolute bottom-32 left-1/4 w-52 h-24 bg-primary/5 rounded-full blur-2xl animate-pulse-slow opacity-70 animation-delay-4000"></div>
          
          {/* Partículas flutuantes */}
          {mobileParticles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-primary/20 rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>

        <MobileHeader />
        <NavigationTabs />
        <main
          className={`flex-1 px-4 space-y-6 relative z-10 transition-all duration-1000 ease-out ${
            mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
          }`}
        >
          <ServiceGrid />
          <PromoBanner />
          <ProductsCatalog />
        </main>
        <BottomNav />
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-40px) translateX(-10px);
            opacity: 0.6;
          }
          75% {
            transform: translateY(-20px) translateX(5px);
            opacity: 0.4;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  )
}
