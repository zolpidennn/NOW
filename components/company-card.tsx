import Image from "next/image"
import { Star, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface CompanyCardProps {
  id: string
  company_name: string
  description: string
  rating: number
  total_reviews: number
  address: string
  city: string
  state: string
  logo: string
  specialties: string[]
  responseTime: string
  className?: string
}

export function CompanyCard({
  id,
  company_name,
  description,
  rating,
  total_reviews,
  address,
  city,
  state,
  logo,
  specialties,
  responseTime,
  className,
}: CompanyCardProps) {
  // Generate fallback image if logo is empty
  const logoUrl = logo && logo.trim() 
    ? logo 
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(company_name)}`

  return (
    <div className={cn("rounded-lg overflow-hidden bg-card border border-border hover:border-primary/50 transition-all active:scale-95", className)}>
      {/* Imagem da empresa */}
      <div className="relative w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden group">
        <Image
          src={logoUrl}
          alt={company_name}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      {/* Informações */}
      <div className="p-4 space-y-3">
        {/* Nome e avaliação */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-base hover:text-primary transition-colors">
              {company_name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950 px-2 py-1 rounded">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{rating?.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground">{total_reviews ?? 0} avaliações</span>
          </div>
        </div>

        {/* Localização e tempo de resposta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{city}, {state}</span>
          </div>
          <div>⏱️ {responseTime}</div>
          
        </div>

        {/* Especialidades */}
        <div className="flex flex-wrap gap-2">
          {specialties.map((specialty) => (
            <span
              key={specialty}
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
