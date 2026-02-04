"use client"

import { Check, Shield, Clock, Headphones, Award, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"

interface Category {
  id: string
  name: string
  description: string
  slug: string
  explanation?: string
  importance_text?: string
  how_now_helps?: string
  benefits?: string[]
  available_services?: string[]
}

export function ServiceCategoryDetail({ category }: { category: Category }) {
  const benefits = category.benefits || []
  const services = category.available_services || []

  const rotatingMessages = [
    {
      reason: "Problemas inesperados podem surgir a qualquer momento",
      stat: "70% das emergências domésticas acontecem sem aviso prévio"
    },
    {
      reason: "Manutenção preventiva evita custos maiores",
      stat: "Reparos preventivos economizam até 40% em consertos futuros"
    },
    {
      reason: "Profissionais qualificados garantem segurança",
      stat: "Serviços realizados por especialistas reduzem riscos em 80%"
    },
    {
      reason: "Tempo é precioso - resolva rápido",
      stat: "Média de 2-4 horas para resolução de problemas comuns"
    },
    {
      reason: "Qualidade de vida depende de ambientes funcionais",
      stat: "Famílias relatam 60% mais satisfação após manutenções"
    }
  ]

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % rotatingMessages.length)
    }, 4000) // Rotate every 4 seconds

    return () => clearInterval(interval)
  }, [rotatingMessages.length])

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
          Categoria
        </div>
<<<<<<< HEAD
        <h1 className="mb-3 text-3xl font-bold text-foreground">{category.name}</h1>
        {category.explanation && <p className="text-muted-foreground text-lg">{category.explanation}</p>}
      </div>

      {category.importance_text && (
        <Card className="mb-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-900/50 shadow-sm p-6">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h2 className="font-bold text-foreground text-lg">Por que é importante?</h2>
          </div>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 mb-4">{category.importance_text}</p>
          <div className="border-t border-red-200 dark:border-red-900/50 pt-4">
            <div className="transition-opacity duration-500 ease-in-out">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                {rotatingMessages[currentMessageIndex].reason}
              </p>
              <p className="text-lg font-bold text-red-800 dark:text-red-300">
=======
        <h1 className="mb-3 text-3xl font-bold text-black">{category.name}</h1>
        {category.explanation && <p className="text-gray-600 text-lg">{category.explanation}</p>}
      </div>

      {category.importance_text && (
        <Card className="mb-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-none shadow-sm p-6">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            <h2 className="font-bold text-black text-lg">Por que é importante?</h2>
          </div>
          <p className="text-sm leading-relaxed text-gray-800 mb-4">{category.importance_text}</p>
          <div className="border-t border-red-200 pt-4">
            <div className="transition-opacity duration-500 ease-in-out">
              <p className="text-sm font-semibold text-red-700 mb-1">
                {rotatingMessages[currentMessageIndex].reason}
              </p>
              <p className="text-lg font-bold text-red-800">
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
                {rotatingMessages[currentMessageIndex].stat}
              </p>
            </div>
          </div>
        </Card>
      )}

      {category.how_now_helps && (
<<<<<<< HEAD
        <Card className="mb-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-black border-none shadow-lg p-6 text-white">
=======
        <Card className="mb-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-lg p-6 text-white">
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-400" />
            <h2 className="font-bold text-lg">Como a NOW facilita</h2>
          </div>
<<<<<<< HEAD
          <p className="text-sm leading-relaxed text-gray-100 dark:text-gray-200">{category.how_now_helps}</p>
=======
          <p className="text-sm leading-relaxed text-gray-100">{category.how_now_helps}</p>
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
          <div className="mt-4 flex items-center gap-2 text-xs text-yellow-400">
            <Star className="h-4 w-4 fill-yellow-400" />
            <span className="font-semibold">Compromisso com qualidade e transparência</span>
          </div>
        </Card>
      )}

      {services.length > 0 && (
        <div className="mb-6">
<<<<<<< HEAD
          <h2 className="mb-4 text-xl font-bold text-foreground">Serviços Disponíveis</h2>
=======
          <h2 className="mb-4 text-xl font-bold text-black">Serviços Disponíveis</h2>
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
          <div className="space-y-2">
            {services.map((service: string, index: number) => (
              <div
                key={index}
<<<<<<< HEAD
                className="flex items-start gap-3 rounded-xl bg-background dark:bg-input/20 p-4 shadow-sm border border-border"
              >
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-foreground">{service}</span>
=======
                className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100"
              >
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-sm font-medium text-gray-800">{service}</span>
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
              </div>
            ))}
          </div>
        </div>
      )}

      {benefits.length > 0 && (
        <div className="mb-6">
<<<<<<< HEAD
          <h2 className="mb-4 text-xl font-bold text-foreground">O que a NOW oferece?</h2>
=======
          <h2 className="mb-4 text-xl font-bold text-black">O que a NOW oferece?</h2>
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((benefit: string, index: number) => (
              <div
                key={index}
<<<<<<< HEAD
                className="rounded-xl bg-secondary/40 dark:bg-input/20 p-4 border border-border"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 dark:bg-primary/70">
=======
                className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 border border-gray-200"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-black">
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
                  {index % 3 === 0 && <Clock className="h-5 w-5 text-white" />}
                  {index % 3 === 1 && <Shield className="h-5 w-5 text-white" />}
                  {index % 3 === 2 && <Headphones className="h-5 w-5 text-white" />}
                </div>
<<<<<<< HEAD
                <p className="text-xs font-semibold leading-tight text-foreground">{benefit}</p>
=======
                <p className="text-xs font-semibold leading-tight text-gray-800">{benefit}</p>
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
              </div>
            ))}
          </div>
        </div>
      )}

<<<<<<< HEAD
      <Card className="mb-6 rounded-2xl border border-border bg-background dark:bg-input/10 p-6 shadow-md">
        <h3 className="mb-3 text-lg font-bold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Garantia NOW - Por que confiar?
        </h3>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
=======
      <Card className="mb-6 rounded-2xl border-2 border-black bg-white p-6 shadow-md">
        <h3 className="mb-3 text-lg font-bold text-black flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Garantia NOW - Por que confiar?
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-black mt-2" />
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
            <span>
              <strong>Transparência total:</strong> Prestadores verificados, com avaliações reais de clientes.
            </span>
          </li>
          <li className="flex items-start gap-2">
<<<<<<< HEAD
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
=======
            <div className="h-1.5 w-1.5 rounded-full bg-black mt-2" />
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
            <span>
              <strong>Atendimento completo:</strong> Suporte da NOW antes, durante e após o serviço.
            </span>
          </li>
          <li className="flex items-start gap-2">
<<<<<<< HEAD
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
=======
            <div className="h-1.5 w-1.5 rounded-full bg-black mt-2" />
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
            <span>
              <strong>Técnicos qualificados:</strong> Profissionais certificados e com experiência comprovada.
            </span>
          </li>
          <li className="flex items-start gap-2">
<<<<<<< HEAD
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
=======
            <div className="h-1.5 w-1.5 rounded-full bg-black mt-2" />
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
            <span>
              <strong>Garantia nos serviços:</strong> Mais segurança e proteção em todos os atendimentos realizados pela plataforma.
            </span>
          </li>
          <li className="flex items-start gap-2">
<<<<<<< HEAD
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
=======
            <div className="h-1.5 w-1.5 rounded-full bg-black mt-2" />
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
            <span>
              <strong>Acompanhe em tempo real:</strong> Acompanhe o status do serviço diretamente pelo app.
            </span>
          </li>
          <li className="flex items-start gap-2">
<<<<<<< HEAD
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
=======
            <div className="h-1.5 w-1.5 rounded-full bg-black mt-2" />
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
            <span>
              <strong>Suporte disponível:</strong> Nossa equipe está sempre pronta para ajudar quando você precisar.
            </span>
          </li>
        </ul>
      </Card>

      <Button
        asChild
        size="lg"
<<<<<<< HEAD
        className="h-14 w-full rounded-xl bg-primary hover:bg-primary/90 text-base font-bold shadow-lg text-primary-foreground"
=======
        className="h-14 w-full rounded-xl bg-black hover:bg-gray-900 text-base font-bold shadow-lg"
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
      >
        <Link href={`/services/request?category=${category.id}`}>Solicitar Serviço Agora</Link>
      </Button>

<<<<<<< HEAD
      <p className="text-center text-xs text-muted-foreground mt-4">
=======
      <p className="text-center text-xs text-gray-500 mt-4">
>>>>>>> 1fad47db41719a2e913bac89d1f352d0dc539db8
        Ao solicitar, você será conectado com empresas credenciadas NOW
      </p>
    </div>
  )
}
