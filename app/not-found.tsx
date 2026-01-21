import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Construction, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="text-8xl font-bold text-gray-300">404</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ops! Essa rota não está segura 🚧
          </h1>
          <p className="text-gray-600 leading-relaxed">
            A página que você tentou acessar não foi encontrada.
            Mas fique tranquilo — a NOW te leva de volta ao caminho certo.
          </p>
        </div>

        <div className="flex justify-center">
          <Construction className="h-16 w-16 text-orange-500" />
        </div>

        <Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Voltar para o início
          </Link>
        </Button>
      </div>
    </div>
  )
}