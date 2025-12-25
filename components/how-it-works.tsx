import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Calendar, MessageSquare, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "1. Escolha o Serviço",
    description: "Navegue pelas categorias e encontre o serviço que você precisa",
  },
  {
    icon: Calendar,
    title: "2. Solicite e Agende",
    description: "Preencha os detalhes e escolha o melhor horário para você",
  },
  {
    icon: MessageSquare,
    title: "3. Acompanhe em Tempo Real",
    description: "Comunique-se diretamente com o prestador e acompanhe o status",
  },
  {
    icon: CheckCircle,
    title: "4. Serviço Concluído",
    description: "Avalie o serviço e ajude outros usuários",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-border/40 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Como Funciona</h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Processo simples e transparente do início ao fim
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
