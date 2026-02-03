import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Calendar, MessageSquare, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "1. Crie sua Solicitação",
    description: "Escolha a categoria do serviço e defina a urgência (Agora, 24h ou Agendado)",
  },
  {
    icon: Calendar,
    title: "2. Receba Propostas",
    description: "Técnicos qualificados recebem seu lead e enviam propostas personalizadas",
  },
  {
    icon: MessageSquare,
    title: "3. Escolha e Pague",
    description: "Selecione a melhor proposta e realize o pagamento de forma segura",
  },
  {
    icon: CheckCircle,
    title: "4. Serviço Realizado",
    description: "Acompanhe em tempo real e avalie o profissional após a conclusão",
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
