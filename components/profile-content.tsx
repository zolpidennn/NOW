import { createClient } from "@/lib/supabase/server"
import { User, MapPin, CreditCard, Settings, LogOut, ChevronRight, Trash2 } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export async function ProfileContent({ user }: { user: SupabaseUser }) {
  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const menuItems = [
    { icon: User, label: "Informações Pessoais", href: "/profile/info" },
    { icon: MapPin, label: "Endereços", href: "/profile/addresses" },
    { icon: CreditCard, label: "Pagamentos", href: "/profile/payments" },
    { icon: Settings, label: "Configurações", href: "/profile/settings" },
  ]

  return (
    <div className="space-y-6 pb-24">
      {/* Header do Perfil */}
      <div className="rounded-xl bg-card p-6 text-center border border-border">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-card-foreground">{profile?.full_name || "Usuário NOW"}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        {profile?.phone && <p className="mt-1 text-sm text-muted-foreground">{profile.phone}</p>}
      </div>

      {/* Menu de Opções */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between p-4 transition-colors hover:bg-muted/50 active:bg-muted ${
                index !== menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-card-foreground">{item.label}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>
          )
        })}
      </div>

      {/* Zona de Perigo */}
      <div className="rounded-xl bg-card border border-destructive/50 overflow-hidden">
        <a
          href="/profile/delete-account"
          className="flex items-center justify-between p-4 transition-colors hover:bg-destructive/10 active:bg-destructive/20"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-destructive" />
            <span className="font-medium text-destructive">Excluir Conta</span>
          </div>
          <ChevronRight className="h-5 w-5 text-destructive" />
        </a>
      </div>

      {/* Botão de Logout */}
      <form action="/auth/logout" method="post">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive p-4 font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 active:bg-destructive/80"
        >
          <LogOut className="h-5 w-5" />
          Sair da Conta
        </button>
      </form>
    </div>
  )
}
