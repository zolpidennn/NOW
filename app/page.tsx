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

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
          <div
            className={`space-y-8 transition-all duration-1000 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
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
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-primary/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        <MobileHeader />
        <NavigationTabs />
        <main
          className={`flex-1 px-4 space-y-6 relative z-10 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
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
