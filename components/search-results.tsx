"use client"

import { useEffect, useState } from "react"
import { Clock, MapPin } from "lucide-react"
import Link from "next/link"

interface ServiceItem {
  id: string
  title: string
  category: string
  serviceId: string
  description: string
}

const categoryMap: Record<string, string> = {
  CFTV: "cftv",
  Portões: "portoes",
  Alarmes: "alarmes",
  "Controle de Acesso": "controle-acesso",
  Interfones: "interfones",
  Rede: "rede",
  Elétrica: "eletrica",
}

// Base de dados completa de serviços
const allServices: ServiceItem[] = [
  // CFTV
  {
    id: "1",
    title: "Manutenção corretiva de câmeras",
    category: "CFTV",
    serviceId: "cftv",
    description: "Reparo de câmeras com defeito",
  },
  {
    id: "2",
    title: "Câmera sem imagem",
    category: "CFTV",
    serviceId: "cftv",
    description: "Diagnóstico e solução para câmeras sem imagem",
  },
  {
    id: "3",
    title: "Câmera com imagem escura",
    category: "CFTV",
    serviceId: "cftv",
    description: "Ajuste de brilho e qualidade de imagem",
  },
  {
    id: "4",
    title: "Câmera fora de foco",
    category: "CFTV",
    serviceId: "cftv",
    description: "Ajuste de foco das câmeras",
  },
  {
    id: "5",
    title: "Troca de câmera",
    category: "CFTV",
    serviceId: "cftv",
    description: "Substituição de câmeras danificadas",
  },
  {
    id: "6",
    title: "Limpeza de lente",
    category: "CFTV",
    serviceId: "cftv",
    description: "Limpeza profissional das lentes",
  },
  {
    id: "7",
    title: "Configuração de DVR/NVR",
    category: "CFTV",
    serviceId: "cftv",
    description: "Setup e configuração de gravadores",
  },
  {
    id: "8",
    title: "Acesso remoto no celular",
    category: "CFTV",
    serviceId: "cftv",
    description: "Configuração de visualização mobile",
  },
  {
    id: "9",
    title: "Instalação de novas câmeras",
    category: "CFTV",
    serviceId: "cftv",
    description: "Instalação completa de câmeras",
  },

  // Portões
  {
    id: "10",
    title: "Portão não abre",
    category: "Portões",
    serviceId: "portoes",
    description: "Diagnóstico e reparo de portão travado",
  },
  {
    id: "11",
    title: "Portão não fecha",
    category: "Portões",
    serviceId: "portoes",
    description: "Solução para portão que não fecha",
  },
  {
    id: "12",
    title: "Portão abrindo sozinho",
    category: "Portões",
    serviceId: "portoes",
    description: "Reparo de acionamento indevido",
  },
  {
    id: "13",
    title: "Troca de motor",
    category: "Portões",
    serviceId: "portoes",
    description: "Substituição de motor de portão",
  },
  {
    id: "14",
    title: "Lubrificação",
    category: "Portões",
    serviceId: "portoes",
    description: "Manutenção preventiva com lubrificação",
  },
  {
    id: "15",
    title: "Ajuste de fim de curso",
    category: "Portões",
    serviceId: "portoes",
    description: "Calibração de limites de movimento",
  },

  // Alarmes
  {
    id: "16",
    title: "Central de alarme disparando",
    category: "Alarmes",
    serviceId: "alarmes",
    description: "Correção de alarmes falsos",
  },
  {
    id: "17",
    title: "Alarme disparando sem motivo",
    category: "Alarmes",
    serviceId: "alarmes",
    description: "Ajuste de sensibilidade",
  },
  {
    id: "18",
    title: "Sensor de presença com falha",
    category: "Alarmes",
    serviceId: "alarmes",
    description: "Reparo de sensores PIR",
  },
  {
    id: "19",
    title: "Sensor de abertura defeituoso",
    category: "Alarmes",
    serviceId: "alarmes",
    description: "Troca de sensores magnéticos",
  },
  {
    id: "20",
    title: "Configuração da central",
    category: "Alarmes",
    serviceId: "alarmes",
    description: "Programação completa da central",
  },

  // Controle de Acesso
  {
    id: "21",
    title: "Fechadura eletrônica travada",
    category: "Controle de Acesso",
    serviceId: "controle-acesso",
    description: "Desbloqueio de fechaduras",
  },
  {
    id: "22",
    title: "Leitor biométrico com erro",
    category: "Controle de Acesso",
    serviceId: "controle-acesso",
    description: "Correção de leitores biométricos",
  },
  {
    id: "23",
    title: "Leitor de cartão sem leitura",
    category: "Controle de Acesso",
    serviceId: "controle-acesso",
    description: "Reparo de leitores RFID",
  },
  {
    id: "24",
    title: "Cadastro de usuários",
    category: "Controle de Acesso",
    serviceId: "controle-acesso",
    description: "Cadastro e gestão de acessos",
  },

  // Interfones
  {
    id: "25",
    title: "Interfone sem áudio",
    category: "Interfones",
    serviceId: "interfones",
    description: "Reparo de áudio de interfones",
  },
  {
    id: "26",
    title: "Interfone sem chamada",
    category: "Interfones",
    serviceId: "interfones",
    description: "Correção de campainha",
  },
  {
    id: "27",
    title: "Vídeo porteiro sem imagem",
    category: "Interfones",
    serviceId: "interfones",
    description: "Reparo de vídeo porteiro",
  },
  {
    id: "28",
    title: "Integração com celular",
    category: "Interfones",
    serviceId: "interfones",
    description: "Conexão com smartphone",
  },

  // Rede
  {
    id: "29",
    title: "Rede fora do ar",
    category: "Rede",
    serviceId: "rede",
    description: "Diagnóstico e restauração de rede",
  },
  { id: "30", title: "Internet instável", category: "Rede", serviceId: "rede", description: "Otimização de conexão" },
  {
    id: "31",
    title: "Cabeamento estruturado",
    category: "Rede",
    serviceId: "rede",
    description: "Instalação de rede cabeada",
  },

  // Elétrica
  {
    id: "32",
    title: "Fonte queimada",
    category: "Elétrica",
    serviceId: "eletrica",
    description: "Substituição de fontes",
  },
  {
    id: "33",
    title: "Curto em equipamentos",
    category: "Elétrica",
    serviceId: "eletrica",
    description: "Correção de curto-circuito",
  },
  {
    id: "34",
    title: "Falha de alimentação",
    category: "Elétrica",
    serviceId: "eletrica",
    description: "Reparo de alimentação elétrica",
  },
]

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<ServiceItem[]>([])

  useEffect(() => {
    // Filtrar serviços baseado na busca
    const filtered = allServices.filter(
      (service) =>
        service.title.toLowerCase().includes(query.toLowerCase()) ||
        service.description.toLowerCase().includes(query.toLowerCase()) ||
        service.category.toLowerCase().includes(query.toLowerCase()),
    )
    setResults(filtered)
  }, [query])

  if (results.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Nenhum serviço encontrado para "{query}"</p>
        <p className="mt-2 text-sm text-muted-foreground">Tente buscar por outros termos</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "serviço encontrado" : "serviços encontrados"}
      </p>

      {results.map((service) => (
        <Link
          key={service.id}
          href={`/services/${service.serviceId}`}
          className="block rounded-xl bg-card p-4 shadow-sm transition-shadow active:shadow-md border border-border"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <span className="mb-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {service.category}
              </span>
              <h3 className="font-semibold text-card-foreground">{service.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Atendimento rápido
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Sua região
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
