"use client"

import { CreditCard, ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Formas de Pagamento</h1>
        </div>

        <Card className="p-12 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Em breve</p>
          <p className="text-sm text-muted-foreground">
            A gestão de cartões e formas de pagamento estará disponível em breve
          </p>
        </Card>
      </div>
    </div>
  )
}
