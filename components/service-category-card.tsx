"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ServiceCategory } from "@/lib/types"
import { Camera, Bell, DoorOpen, Shield, Phone, Zap, ChevronRight } from "lucide-react"
import Link from "next/link"

const iconMap = {
  Camera,
  Bell,
  DoorOpen,
  Shield,
  Phone,
  Zap,
}

interface ServiceCategoryCardProps {
  category: ServiceCategory
}

export function ServiceCategoryCard({ category }: ServiceCategoryCardProps) {
  const Icon = iconMap[category.icon_name as keyof typeof iconMap] || Shield

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">{category.name}</CardTitle>
        <CardDescription className="line-clamp-2">{category.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="ghost" className="group/button w-full justify-between" asChild>
          <Link href={`/categories/${category.slug || category.id}`}>
            Ver Detalhes
            <ChevronRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
