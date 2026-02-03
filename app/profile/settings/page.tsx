"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, MonitorSmartphone, RotateCcw, ChevronRight, LayoutDashboard } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [notifications, setNotifications] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    if (savedTheme) {
      setTheme(savedTheme)
    }

    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.email === "leonardo@oliport.com.br") {
      setIsAdmin(true)
    }
    setLoading(false)
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    if (newTheme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", isDark)
    } else {
      document.documentElement.classList.toggle("dark", newTheme === "dark")
    }
  }

  const handleResetApp = () => {
    if (confirm("Tem certeza que deseja resetar o aplicativo? Isso limpará todas as configurações locais.")) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">Configurações</h1>

        {!loading && isAdmin && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <Link href="/admin/dashboard">
              <Button className="w-full justify-between h-auto py-4" variant="default">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Dashboard Administrativo</div>
                    <div className="text-xs opacity-90">Gerenciar toda a plataforma NOW</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </Card>
        )}

        {/* Tema */}
        <Card className="p-4">
          <h2 className="mb-4 font-semibold text-lg">Aparência</h2>
          <div className="space-y-3">
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex w-full items-center justify-between rounded-lg border p-4 transition-colors ${
                theme === "light" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5" />
                <span>Modo Claro</span>
              </div>
              {theme === "light" && <div className="h-2 w-2 rounded-full bg-primary" />}
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex w-full items-center justify-between rounded-lg border p-4 transition-colors ${
                theme === "dark" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5" />
                <span>Modo Escuro</span>
              </div>
              {theme === "dark" && <div className="h-2 w-2 rounded-full bg-primary" />}
            </button>
            <button
              onClick={() => handleThemeChange("system")}
              className={`flex w-full items-center justify-between rounded-lg border p-4 transition-colors ${
                theme === "system" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <MonitorSmartphone className="h-5 w-5" />
                <span>Automático (Sistema)</span>
              </div>
              {theme === "system" && <div className="h-2 w-2 rounded-full bg-primary" />}
            </button>
          </div>
        </Card>

        {/* Notificações */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notificações</Label>
              <p className="text-sm text-muted-foreground">Receber notificações push</p>
            </div>
            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </Card>

        {/* Resetar App */}
        <Card className="p-4">
          <Button onClick={handleResetApp} variant="outline" className="w-full justify-between bg-transparent">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5" />
              <span>Resetar Aplicativo</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </Card>

        {/* Voltar */}
        <Link href="/profile">
          <Button variant="ghost" className="w-full">
            Voltar ao perfil
          </Button>
        </Link>
      </div>
    </div>
  )
}
