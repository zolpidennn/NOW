"use client"

import { AlertCircle, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OfflineClientPage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Wifi className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Sem Conexão</CardTitle>
          <CardDescription>Você está offline no momento. Verifique sua conexão com a internet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Algumas funcionalidades estão limitadas</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Páginas visitadas recentemente ainda estão disponíveis</li>
                <li>Novas solicitações de serviço não podem ser criadas</li>
                <li>Dados podem estar desatualizados</li>
              </ul>
            </div>
          </div>

          <Button onClick={handleRetry} className="w-full" size="lg">
            <Wifi className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
