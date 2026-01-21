import { createClient } from "@/lib/supabase/server"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { ServiceOrdersList } from "@/components/service-orders-list"
import { ProductOrdersList } from "@/components/product-orders-list"
import { Calendar } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="page-transition flex min-h-screen flex-col bg-background pb-20">
        <MobileHeader />
        <main className="flex flex-1 flex-col items-center justify-center px-4">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Faça login para ver seus pedidos</h2>
          <p className="text-center text-muted-foreground mb-6">
            Para acessar seus agendamentos e acompanhar seus serviços, você precisa estar cadastrado.
          </p>
          <a
            href="/auth/login"
            className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors active:bg-primary/90"
          >
            Fazer Login
          </a>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page-transition flex min-h-screen flex-col bg-background pb-20">
      <MobileHeader />
      <main className="flex-1 px-4 py-4">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Meus Pedidos</h1>

        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="products">Carrinho</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Acompanhe seus agendamentos, veja dados completos e converse em tempo real com as empresas
            </div>
            <ServiceOrdersList userId={user.id} />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Acompanhe suas compras, rastreamento e previsão de entrega
            </div>
            <ProductOrdersList userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  )
}
