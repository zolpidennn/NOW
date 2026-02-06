import { createClient } from "@/lib/supabase/server"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { ProfileContent } from "@/components/profile-content"
import { User } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="page-transition flex min-h-screen flex-col bg-background pb-20">
        <MobileHeader />
        <main className="flex flex-1 flex-col items-center justify-center px-4">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Faça login para acessar seu perfil</h2>
          <p className="text-center text-muted-foreground mb-6">
            Para gerenciar suas informações, endereços e configurações, você precisa estar cadastrado.
          </p>
          <div className="flex gap-3">
            <a
              href="/auth/login"
              className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors active:bg-primary/90"
            >
              Fazer Login
            </a>
            <a
              href="/auth/sign-up"
              className="rounded-full border-2 border-border px-8 py-3 font-semibold text-foreground transition-colors active:bg-muted"
            >
              Cadastrar
            </a>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page-transition flex min-h-screen flex-col bg-background pb-20">
      <MobileHeader />
      <main className="flex-1 px-4 py-4">
        <ProfileContent user={user} />
      </main>
      <BottomNav />
    </div>
  )
}
