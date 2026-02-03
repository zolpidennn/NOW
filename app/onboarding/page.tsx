"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, ArrowRight, Sparkles, Zap, Users, CheckCircle, MapPin, Star, ChevronRight, Clock, Award, Heart, ChevronLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const steps = [
    {
      title: "Bem-vindo à NOW",
      subtitle: "Segurança profissional ao seu alcance",
      description: "A primeira plataforma brasileira especializada em serviços de segurança eletrônica. Conectamos você aos melhores profissionais do mercado.",
      icon: Shield,
      bgColor: "from-blue-500/10 via-primary/5 to-purple-500/10",
      features: [
        "CFTV, Alarmes e Controle de Acesso",
        "Profissionais certificados ABNT",
        "Atendimento especializado"
      ]
    },
    {
      title: "Atendimento Express",
      subtitle: "Emergências resolvidas rapidamente",
      description: "Problemas de segurança não esperam. Nossa rede de profissionais está pronta para atender emergências com resposta em até 2 horas.",
      icon: Clock,
      bgColor: "from-orange-500/10 via-yellow-500/5 to-red-500/10",
      features: [
        "Resposta em até 2 horas",
        "Suporte 24/7 via WhatsApp",
        "Soluções temporárias imediatas"
      ]
    },
    {
      title: "Profissionais Verificados",
      subtitle: "Qualidade e confiança garantidas",
      description: "Todos os nossos parceiros passam por rigorosa verificação técnica e possuem certificações atualizadas do mercado de segurança.",
      icon: Award,
      bgColor: "from-green-500/10 via-teal-500/5 to-blue-500/10",
      features: [
        "Certificações técnicas válidas",
        "Avaliações de clientes reais",
        "Seguro de responsabilidade civil"
      ]
    },
    {
      title: "Vamos começar?",
      subtitle: "Configure seu perfil e encontre ajuda",
      description: "Cadastre seus endereços e preferências para receber recomendações personalizadas dos melhores profissionais da sua região.",
      icon: Heart,
      bgColor: "from-purple-500/10 via-pink-500/5 to-rose-500/10",
      features: [
        "Endereços salvos com segurança",
        "Histórico completo de serviços",
        "Recomendações inteligentes"
      ]
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleFinish()
  }

  const handleFinish = async () => {
    setIsLoading(true)

    try {
      // Marcar que o usuário viu o onboarding
      localStorage.setItem('onboarding_completed', 'true')

      // Redirecionar para a página principal
      router.push('/')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      router.push('/')
    }
  }

  // Verificar se já completou o onboarding e se é mobile
  useEffect(() => {
    // Verificar se é mobile
    const isMobile = window.innerWidth < 768
    if (!isMobile) {
      router.push('/')
      return
    }

    const completed = localStorage.getItem('onboarding_completed')
    if (completed === 'true') {
      router.push('/')
    }
  }, [router])

  const currentStepData = steps[currentStep]
  const IconComponent = currentStepData.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute bottom-40 left-1/4 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-4000"></div>

        {/* Geometric Shapes */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-primary/30 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-purple-500/20 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/6 w-3 h-3 bg-blue-500/25 rounded-full animate-float animation-delay-2000"></div>

        {/* Additional decorative elements */}
        <div className="absolute top-1/6 right-1/6 w-2 h-2 bg-orange-500/40 rotate-45 animate-float animation-delay-3000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-5 h-5 bg-green-500/15 rounded-lg animate-float animation-delay-1500"></div>
        <div className="absolute top-3/4 left-1/5 w-3 h-3 bg-pink-500/20 rounded-full animate-float animation-delay-2500"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center p-6">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">NOW</span>
          </div>
          {currentStep < steps.length - 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Pular
            </Button>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Step Indicator */}
          <div className="flex gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-8 bg-primary shadow-lg"
                    : index < currentStep
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Content Card */}
          <div
            className={`w-full max-w-md bg-card/60 backdrop-blur-sm rounded-3xl p-8 border border-border/50 shadow-2xl transition-all duration-500 ${
              currentStep === 0 ? 'animate-in slide-in-from-bottom-4 duration-700' :
              currentStep === 1 ? 'animate-in slide-in-from-right-4 duration-700' :
              currentStep === 2 ? 'animate-in slide-in-from-left-4 duration-700' :
              'animate-in fade-in duration-700'
            }`}
          >
            {/* Icon */}
            <div className={`mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br ${currentStepData.bgColor} flex items-center justify-center mb-6`}>
              <IconComponent className="h-10 w-10 text-primary" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {currentStepData.title}
            </h1>

            {/* Subtitle */}
            <h2 className="text-lg text-primary font-semibold mb-3">
              {currentStepData.subtitle}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {currentStepData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleNext}
                size="lg"
                className="w-full group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Carregando...
                  </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Começar Agora
                  <Sparkles className="ml-2 h-4 w-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                </>
              ) : (
                  <>
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {currentStep > 0 && currentStep < steps.length - 1 && (
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  size="lg"
                  className="w-full group"
                  disabled={isLoading}
                >
                  <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Voltar
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <footer className="p-6">
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : index < currentStep
                    ? "w-2 bg-primary/50 hover:bg-primary/70"
                    : "w-2 bg-muted hover:bg-muted-foreground/50"
                }`}
                aria-label={`Ir para passo ${index + 1}`}
              />
            ))}
          </div>

          {/* Progress Text */}
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              {currentStep + 1} de {steps.length}
            </p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.7;
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
          animation: float 6s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .slide-in-from-bottom-4 {
          animation-name: slide-in-from-bottom-4;
        }

        .slide-in-from-right-4 {
          animation-name: slide-in-from-right-4;
        }

        .slide-in-from-left-4 {
          animation-name: slide-in-from-left-4;
        }

        .fade-in {
          animation-name: fade-in;
        }

        @keyframes slide-in-from-bottom-4 {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-from-right-4 {
          from {
            opacity: 0;
            transform: translateX(1rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-from-left-4 {
          from {
            opacity: 0;
            transform: translateX(-1rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}