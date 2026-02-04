import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Garantir que o perfil seja criado após login OAuth
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Verificar se o perfil já existe
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single()

        let needsNameConfirmation = false

        // Se não existe perfil, criar um temporário
        if (!existingProfile) {
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            `${user.user_metadata?.given_name || ""} ${user.user_metadata?.family_name || ""}`.trim() ||
            "Usuário"

          await supabase.from("profiles").insert({
            id: user.id,
            full_name: fullName,
            phone: user.user_metadata?.phone || null,
          })

          // Se o nome veio como "Usuário" ou vazio, precisa confirmar
          if (!fullName || fullName === "Usuário" || fullName.trim().length < 3) {
            needsNameConfirmation = true
          }
        } else {
          // Se o perfil existe mas o nome está incompleto, precisa confirmar
          const currentName = existingProfile.full_name || ""
          if (!currentName || currentName === "Usuário" || currentName.trim().length < 3) {
            needsNameConfirmation = true
          }
        }

        // Se precisa confirmar o nome, redirecionar para página de confirmação
        if (needsNameConfirmation) {
          return NextResponse.redirect(`${origin}/auth/complete-profile`)
        }
      }

      // Se tudo está OK, redirecionar para a página solicitada ou home
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
