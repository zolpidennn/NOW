"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const banners = [
  {
    id: 1,
    title: "Primeira instalação com desconto",
    subtitle: "Ganhe até R$ 50 OFF",
    color: "bg-gradient-to-r from-gray-900 to-gray-700",
  },
  {
    id: 2,
    title: "Manutenção preventiva",
    subtitle: "A partir de R$ 99",
    color: "bg-gradient-to-r from-gray-800 to-gray-600",
  },
]

export function PromoBanner() {
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-6">
      <div className="relative aspect-[2/1] overflow-hidden rounded-2xl">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              index === currentBanner ? "opacity-100" : "opacity-0",
            )}
          >
            <div className={`flex h-full flex-col justify-center px-6 ${banner.color}`}>
              <h2 className="text-xl font-bold text-white mb-1">{banner.title}</h2>
              <p className="text-sm text-white/90">{banner.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === currentBanner ? "w-6 bg-black" : "w-1.5 bg-gray-300",
            )}
          />
        ))}
      </div>
    </section>
  )
}
