"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Analytics } from "@vercel/analytics/next"
import { SplashScreen } from "@/components/splash-screen"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [showSplash, setShowSplash] = useState(true)
  const [splashCompleted, setSplashCompleted] = useState(false)

  useEffect(() => {
    const splashShown = sessionStorage.getItem("splashShown")
    if (splashShown) {
      setShowSplash(false)
      setSplashCompleted(true)
    }
  }, [])

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashShown", "true")
    setSplashCompleted(true)
  }

  return (
    <div className="font-sans antialiased overflow-x-hidden">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className={splashCompleted ? "block" : "hidden"}>{children}</div>
      <Analytics />
    </div>
  )
}
