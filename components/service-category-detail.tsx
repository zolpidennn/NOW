"use client"

import { Check, Shield, Clock, Headphones, Award, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card } from "@/components/ui/card"

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

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
          Categoria
        </div>
        <h1 className="mb-3 text-3xl font-bold text-black">{category.name}</h1>
        {category.explanation && <p className="text-gray-600 text-lg">{category.explanation}</p>}
      </div>

      {category.importance_text && (
        <Card className="mb-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-none shadow-sm p-6">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            <h2 className="font-bold text-black text-lg">Por que é importante?</h2>
          </div>
          <p className="text-sm leading-relaxed text-gray-800">{category.importance_text}</p>
        </Card>
      )}

      {category.how_now_helps && (
        <Card className="mb-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-lg p-6 text-white">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-400" />
            <h2 className="font-bold text-lg">Como a NOW facilita</h2>
          </div>
          <p className="text-sm leading-relaxed text-gray-100">{category.how_now_helps}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-yellow-400">
            <Star className="h-4 w-4 fill-yellow-400" />
            <span className="font-semibold">Compromisso com qualidade e transparência</span>
          </div>
        </Card>
      )}

      {services.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-bold text-black">Serviços Disponíveis</h2>
          <div className="space-y-2">
            {services.map((service: string, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100"
              >
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-sm font-medium text-gray-800">{service}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {benefits.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-bold text-black">O que a NOW oferece?</h2>
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((benefit: string, index: number) => (
              <div
                key={index}
                className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 border border-gray-200"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-black">
                  {index % 3 === 0 && <Clock className="h-5 w-5 text-white" />}
                  {index % 3 === 1 && <Shield className="h-5 w-5 text-white" />}
                  {index % 3 === 2 && <Headphones className="h-5 w-5 text-white" />}
                </div>
                <p className="text-xs font-semibold leading-tight text-gray-800">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card className="mb-6 rounded-2xl border-2 border-black bg-white p-6 shadow-md">
        <h3 className="mb-3 text-lg font-bold text-black flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Garantia NOW - Por que confiar?
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-black mt-2" />
            <span>
              <strong>Transparência total:</strong> Prestadores verificados, com avaliações reais de clientes.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-black mt-2" />
            <span>
              <strong>Atendimento completo:</strong> Suporte da NOW antes, durante e após o serviço.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-black mt-2" />
            <span>
              <strong>Técnicos qualificados:</strong> Profissionais certificados e com experiência comprovada.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-black mt-2" />
            <span>
              <strong>Garantia nos serviços:</strong> Mais segurança e proteção em todos os atendimentos realizados pela plataforma.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-black mt-2" />
            <span>
              <strong>Acompanhe em tempo real:</strong> Acompanhe o status do serviço diretamente pelo app.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-black mt-2" />
            <span>
              <strong>Suporte disponível:</strong> Nossa equipe está sempre pronta para ajudar quando você precisar.
            </span>
          </li>
        </ul>
      </Card>

      <Button
        asChild
        size="lg"
        className="h-14 w-full rounded-xl bg-black hover:bg-gray-900 text-base font-bold shadow-lg"
      >
        <Link href={`/services/request?category=${category.id}`}>Solicitar Serviço Agora</Link>
      </Button>

      <p className="text-center text-xs text-gray-500 mt-4">
        Ao solicitar, você será conectado com empresas credenciadas NOW
      </p>
    </div>
  )
}
