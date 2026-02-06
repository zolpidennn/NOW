import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { CNPJRegistrationForm } from "@/components/cnpj-registration-form"
import { PFRegistrationForm } from "@/components/pf-registration-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, User, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function ProviderRegisterPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Verificar se já é prestador
  const { data: existingProvider } = await supabase
    .from("service_providers")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (existingProvider) {
    redirect("/provider")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Cadastro de Prestador</h1>
              <p className="text-muted-foreground">
                Sistema de cadastro seguro e confiável para pessoas físicas e jurídicas
              </p>
            </div>

            <Alert className="mb-6">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Empresas (PJ)</strong> têm prioridade em buscas e recebem o selo "Empresa Verificada".{" "}
                <strong>Pessoas Físicas (PF)</strong> podem aumentar visibilidade através de avaliações positivas.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="pj" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pj" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Pessoa Jurídica (PJ)
                </TabsTrigger>
                <TabsTrigger value="pf" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Pessoa Física (PF)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pj" className="mt-6">
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Cadastro Pessoa Jurídica
                    </CardTitle>
                    <CardDescription>
                      Empresas verificadas têm prioridade nas buscas e selo de verificação
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Selo "Empresa Verificada"
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Prioridade nos resultados de busca
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Maior visibilidade para clientes
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <CNPJRegistrationForm userId={user.id} />
              </TabsContent>

              <TabsContent value="pf" className="mt-6">
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Cadastro Pessoa Física
                    </CardTitle>
                    <CardDescription>Profissionais autônomos com verificação de identidade</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        Cadastro simplificado com CPF
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        Verificação de identidade com documento
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        Visibilidade aumenta com boas avaliações
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <PFRegistrationForm userId={user.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
