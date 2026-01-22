"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ShieldCheck, CheckCircle } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    async function handleLogout() {
      try {
        const supabase = createClient()

        // Try to sign out
        const { error } = await supabase.auth.signOut()

        if (error) {
          console.error('Logout error:', error)
        }

        // Show success message
        setShowMessage(true)

        // Redirect after 3 seconds
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 3000)
      } catch (error) {
        console.error('Logout error:', error)
        // Still show message and redirect
        setShowMessage(true)
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 3000)
      }
    }

    handleLogout()
  }, [router])

  if (!showMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Encerrando sessão...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-xl">
        <div className="animate-bounce mb-6">
          <ShieldCheck className="h-16 w-16 text-green-600 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Você saiu com segurança 🔒
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Sua sessão foi encerrada com sucesso.<br />
          Quando precisar, a NOW estará pronta para te atender novamente.
        </p>
        
        <div className="flex items-center justify-center space-x-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Logout realizado</span>
        </div>
        
        <div className="mt-6">
          <div className="animate-pulse text-sm text-gray-500">
            Redirecionando em alguns segundos...
          </div>
        </div>
      </div>
    </div>
  )
}
