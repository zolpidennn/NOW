"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Star } from "lucide-react"

interface Provider {
  id: string
  company_name: string
  rating: number
}

export function RecentProviders() {
  const [providers, setProviders] = useState<Provider[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchProviders() {
      const { data } = await supabase
        .from("service_providers")
        .select("id, company_name, rating")
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(8)

      if (data) setProviders(data)
    }

    fetchProviders()
  }, [supabase])

  if (providers.length === 0) return null

  return (
    <section className="py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">Empresas em destaque</h2>
        <Link href="/services" className="text-sm font-medium text-gray-600">
          Ver mais
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {providers.map((provider) => (
          <Link
            key={provider.id}
            href={`/services?provider=${provider.id}`}
            className="flex flex-col items-center gap-2 transition-transform active:scale-95"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-200 bg-white overflow-hidden">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                {provider.company_name.charAt(0)}
              </div>
            </div>
            <div className="text-center">
              <p className="w-20 truncate text-xs font-medium text-black">{provider.company_name}</p>
              <div className="flex items-center justify-center gap-0.5 text-xs text-gray-600">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{provider.rating?.toFixed(1) || "0.0"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
