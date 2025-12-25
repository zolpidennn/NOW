import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <span className="text-xl font-bold">NOW</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#servicos"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Serviços
          </Link>
          <Link
            href="#como-funciona"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Como Funciona
          </Link>
          <Link
            href="/provider"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Seja Parceiro
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Cadastrar</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
