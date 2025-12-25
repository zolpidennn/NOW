import Link from "next/link"
import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-bold">NOW</span>
            </div>
            <p className="text-sm text-muted-foreground">Marketplace de serviços de segurança eletrônica</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Serviços</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/services?category=alarmes" className="transition-colors hover:text-foreground">
                  Alarmes
                </Link>
              </li>
              <li>
                <Link href="/services?category=cftv" className="transition-colors hover:text-foreground">
                  CFTV
                </Link>
              </li>
              <li>
                <Link href="/services?category=automacao" className="transition-colors hover:text-foreground">
                  Automatização
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="transition-colors hover:text-foreground">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/provider" className="transition-colors hover:text-foreground">
                  Seja Parceiro
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-foreground">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-foreground">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-foreground">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} NOW. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
