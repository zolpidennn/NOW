import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Info, Code } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex justify-center mb-6">
          <Shield className="h-16 w-16" />
        </div>

        <h1 className="text-center text-2xl font-bold">NOW</h1>
        <p className="text-center text-muted-foreground">Marketplace de Segurança Eletrônica</p>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Versão</span>
            </div>
            <span className="text-muted-foreground">1.0.0</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Build</span>
            </div>
            <span className="text-muted-foreground">2024.01.001</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Serial</span>
            </div>
            <span className="text-muted-foreground text-xs">NOW-BR-2024-001</span>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-2">Sobre o NOW</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O NOW é o marketplace líder em serviços de segurança eletrônica, conectando clientes a empresas
            especializadas em CFTV, alarmes, controle de acesso e muito mais. Garantimos qualidade no pré e pós-venda
            com profissionais certificados.
          </p>
        </Card>

        <Link href="/profile">
          <Button variant="ghost" className="w-full">
            Voltar ao perfil
          </Button>
        </Link>
      </div>
    </div>
  )
}
