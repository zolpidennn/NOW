import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react"

interface RequestsOverviewProps {
  total: number
  pending: number
  scheduled: number
  completed: number
}

export function RequestsOverview({ total, pending, scheduled, completed }: RequestsOverviewProps) {
  const stats = [
    {
      title: "Total de Solicitações",
      value: total,
      icon: AlertCircle,
    },
    {
      title: "Pendentes",
      value: pending,
      icon: Clock,
    },
    {
      title: "Agendadas",
      value: scheduled,
      icon: Calendar,
    },
    {
      title: "Concluídas",
      value: completed,
      icon: CheckCircle,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
