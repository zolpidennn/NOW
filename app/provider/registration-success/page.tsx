import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, FileCheck, Building2, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function RegistrationSuccessPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: provider } = await supabase
    .from("service_providers")
    .select("*, provider_documents(count)")
    .eq("user_id", user.id)
    .single()

  if (!provider) {
    redirect("/provider/register")
  }

  const providerType = searchParams.type || provider.provider_type || "PJ"
  const isPF = providerType === "pf" || providerType === "PF"

  const hasDocuments = provider.provider_documents && provider.provider_documents[0]?.count > 0

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            {isPF ? <User className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
            Cadastro Realizado com Sucesso!
          </CardTitle>
          <CardDescription>
            {isPF
              ? "Seu cadastro como Pessoa Física foi recebido e está em análise"
              : "Seu cadastro como Pessoa Jurídica foi recebido e está em análise"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {hasDocuments ? (
                  <FileCheck className="h-5 w-5 text-primary" />
                ) : (
                  <Clock className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">
                  {hasDocuments ? "Documentos Recebidos" : "Aguardando Documentos"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {hasDocuments
                    ? isPF
                      ? "Seus documentos de identidade foram recebidos e estão em análise. Você receberá um email quando a verificação for concluída."
                      : "Seus documentos foram recebidos e estão em análise. Você receberá um email quando a verificação for concluída."
                    : "Você pode enviar os documentos depois, mas isso pode atrasar o processo de aprovação."}
                </p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Status atual:</strong>{" "}
                {provider.verification_status === "pending" && "Pendente - Aguardando documentos"}
                {provider.verification_status === "pending_profile" && "Perfil pendente"}
                {provider.verification_status === "pending_documents" && "Documentos pendentes"}
                {provider.verification_status === "pending_identity" && "Verificação de identidade pendente"}
                {provider.verification_status === "under_review" && "Em análise"}
                {provider.verification_status === "verified" && "Verificado"}
              </AlertDescription>
            </Alert>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <p className="font-semibold">Próximos passos:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {isPF ? (
                  <>
                    <li>Nossa equipe irá verificar seu CPF e documentos de identidade</li>
                    <li>Você receberá um email com o resultado da verificação</li>
                    <li>Após aprovação, você poderá começar a receber solicitações</li>
                    <li>Construa sua reputação com boas avaliações para aumentar visibilidade</li>
                    <li>O processo geralmente leva de 1 a 2 dias úteis</li>
                  </>
                ) : (
                  <>
                    <li>Nossa equipe irá analisar seu CNPJ e documentos</li>
                    <li>Você receberá um email com o resultado da análise</li>
                    <li>Após aprovação, você poderá começar a receber solicitações</li>
                    <li>Empresas verificadas têm prioridade nos resultados de busca</li>
                    <li>O processo geralmente leva de 1 a 3 dias úteis</li>
                  </>
                )}
              </ul>
            </div>

            {isPF && (
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dica:</strong> Como Pessoa Física, você pode aumentar sua visibilidade na plataforma através
                  de avaliações positivas dos clientes. Quanto melhor seu histórico, maior sua prioridade nos
                  resultados.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/provider">Ir para Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/">Voltar para Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
