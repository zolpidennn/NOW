import { notFound } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { ServiceCategoryDetail } from "@/components/service-category-detail"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const categoriesData = {
  cftv: {
    id: "cftv",
    name: "CFTV - Câmeras de Segurança",
    description: "Sistemas de Circuito Fechado de TV para monitoramento e gravação de imagens em tempo real",
    importance:
      "O CFTV é essencial para prevenir crimes, monitorar atividades suspeitas e fornecer evidências em caso de incidentes. Estudos mostram que ambientes com câmeras visíveis têm até 60% menos ocorrências criminais.",
    howNowHelps:
      "A NOW conecta você aos melhores técnicos especializados em CFTV, garantindo instalação profissional, manutenção preventiva e suporte técnico 24h. Nossos parceiros são certificados e oferecem garantia em todos os serviços.",
    services: [
      "Manutenção corretiva e preventiva",
      "Câmera sem imagem ou com falhas",
      "Ajuste de foco e ângulo",
      "Configuração de DVR/NVR",
      "Acesso remoto via celular",
      "Troca de HD e expansão de canais",
      "Instalação de novas câmeras",
      "Recuperação de gravações",
    ],
    benefits: [
      "Técnicos especializados e certificados",
      "Atendimento em até 4 horas",
      "Garantia de 90 dias nos serviços",
      "Suporte pré e pós-venda",
      "Orçamento transparente",
      "Acompanhamento via app",
    ],
  },
  portoes: {
    id: "portoes",
    name: "Portões Automáticos",
    description: "Automação de portões residenciais, condominiais e empresariais com segurança e praticidade",
    importance:
      "Portões automáticos oferecem conforto, segurança e valorização do imóvel. Evitam exposição em áreas externas e controlam o acesso de forma eficiente.",
    howNowHelps:
      "Com a NOW, você encontra técnicos especializados em todas as marcas de motores. Realizamos desde manutenções simples até instalações completas, com peças originais e garantia estendida.",
    services: [
      "Portão não abre ou não fecha",
      "Portão abrindo sozinho",
      "Troca de motor e engrenagem",
      "Lubrificação e limpeza de trilho",
      "Ajuste de fim de curso",
      "Instalação de sensores de segurança",
      "Manutenção preventiva",
    ],
    benefits: [
      "Atendimento emergencial 24h",
      "Todas as marcas e modelos",
      "Peças originais disponíveis",
      "Garantia em serviços e peças",
      "Manutenção programada",
    ],
  },
  alarmes: {
    id: "alarmes",
    name: "Sistemas de Alarme",
    description: "Proteção ativa com sensores de presença, abertura e centrais inteligentes",
    importance:
      "Alarmes são a primeira linha de defesa contra invasões. Alertam moradores e autoridades em tempo real, podendo evitar perdas materiais e proteger vidas.",
    howNowHelps:
      "Através da NOW, você tem acesso a especialistas em alarmes que realizam instalação, configuração e manutenção de sistemas integrados com app, câmeras e monitoramento 24h.",
    services: [
      "Alarme disparando sem motivo",
      "Sensor de presença com falha",
      "Sensor de abertura defeituoso",
      "Configuração da central",
      "Integração com app",
      "Ativação/desativação remota",
      "Troca de sensores",
    ],
    benefits: [
      "Centrais com tecnologia de ponta",
      "Integração com smartphone",
      "Configuração personalizada",
      "Suporte técnico especializado",
      "Relatórios de eventos",
    ],
  },
  "controle-acesso": {
    id: "controle-acesso",
    name: "Controle de Acesso",
    description: "Sistemas de biometria, cartões RFID e portaria remota para gerenciar acessos",
    importance:
      "O controle de acesso garante que apenas pessoas autorizadas entrem em ambientes restritos, aumentando a segurança e permitindo auditoria completa de entradas e saídas.",
    howNowHelps:
      "A NOW oferece instalação e manutenção de sistemas de controle de acesso com as melhores marcas do mercado, cadastro de usuários, integração com catracas e portões, e relatórios de acesso.",
    services: [
      "Leitor biométrico com erro",
      "Leitor de cartão sem leitura",
      "Fechadura eletrônica travada",
      "Cadastro de usuários",
      "Integração com portão",
      "Auditoria de acessos",
      "Configuração de regras",
    ],
    benefits: [
      "Sistemas biométricos avançados",
      "Integração com diversos dispositivos",
      "Gestão centralizada de acessos",
      "Relatórios detalhados",
      "Suporte completo",
    ],
  },
  interfones: {
    id: "interfones",
    name: "Interfones e Vídeo Porteiro",
    description: "Comunicação segura entre portaria e residências com áudio e vídeo",
    importance:
      "Interfones e vídeo porteiros permitem identificar visitantes antes de abrir o portão, aumentando a segurança e o conforto dos moradores.",
    howNowHelps:
      "Instalamos e fazemos manutenção de interfones convencionais e vídeo porteiros IP com integração ao celular, permitindo atender visitantes de qualquer lugar.",
    services: [
      "Interfone sem áudio",
      "Interfone sem chamada",
      "Vídeo porteiro sem imagem",
      "Integração com celular",
      "Configuração de ramais",
      "Instalação completa",
    ],
    benefits: ["Interfones IP modernos", "Visualização no celular", "Áudio e vídeo em HD", "Instalação profissional"],
  },
  rede: {
    id: "rede",
    name: "Rede e Internet",
    description: "Infraestrutura de rede para garantir conectividade estável em todos os sistemas",
    importance:
      "Uma rede bem estruturada é fundamental para o funcionamento de câmeras IP, alarmes conectados, controle de acesso e outros sistemas inteligentes.",
    howNowHelps:
      "A NOW oferece serviços completos de cabeamento estruturado, configuração de roteadores, switches e organização de racks, garantindo rede estável e segura.",
    services: [
      "Rede fora do ar",
      "Internet instável",
      "Cabeamento estruturado",
      "Organização de rack",
      "Configuração de roteador",
      "Wi-Fi para áreas comuns",
    ],
    benefits: ["Certificação de cabos", "Equipamentos profissionais", "Otimização de rede", "Documentação completa"],
  },
  eletrica: {
    id: "eletrica",
    name: "Elétrica de Baixa Tensão",
    description: "Instalação e manutenção elétrica especializada para sistemas de segurança",
    importance:
      "A instalação elétrica correta evita queima de equipamentos, garante estabilidade dos sistemas e previne acidentes.",
    howNowHelps:
      "Nossos eletricistas especializados em baixa tensão realizam instalações seguras, aterramentos adequados e organização elétrica para todos os sistemas de segurança.",
    services: [
      "Fonte queimada",
      "Curto em equipamentos",
      "Falha de alimentação",
      "Aterramento",
      "Organização elétrica",
    ],
    benefits: ["Eletricistas especializados", "Instalações seguras", "Garantia nos serviços", "Normas técnicas"],
  },
  preventiva: {
    id: "preventiva",
    name: "Manutenção Preventiva",
    description: "Inspeções regulares para evitar problemas e garantir funcionamento perfeito",
    importance:
      "A manutenção preventiva aumenta a vida útil dos equipamentos, evita paradas inesperadas e garante que tudo funcione quando você mais precisa.",
    howNowHelps:
      "Com planos de manutenção preventiva da NOW, você agenda visitas regulares de técnicos especializados que inspecionam, limpam e ajustam todos os sistemas.",
    services: [
      "Limpeza técnica de câmeras",
      "Revisão de portões",
      "Check-up completo",
      "Relatório técnico",
      "Inspeção mensal",
    ],
    benefits: [
      "Visitas agendadas",
      "Relatórios detalhados",
      "Evita emergências",
      "Economia a longo prazo",
      "Prioridade no atendimento",
    ],
  },
  planos: {
    id: "planos",
    name: "Planos e Contratos",
    description: "Planos mensais com atendimento prioritário e manutenção inclusa",
    importance:
      "Ter um plano de manutenção garante tranquilidade, atendimento rápido em emergências e custos previsíveis.",
    howNowHelps:
      "A NOW oferece planos mensais, trimestrais e anuais com atendimento emergencial incluso, manutenções preventivas e descontos em peças.",
    services: [
      "Plano mensal de manutenção",
      "Plano trimestral",
      "Plano anual",
      "Atendimento emergencial incluso",
      "SLA prioritário",
    ],
    benefits: [
      "Custos previsíveis",
      "Atendimento prioritário",
      "Descontos em serviços",
      "Sem taxas de visita",
      "Relatórios mensais",
    ],
  },
  empresas: {
    id: "empresas",
    name: "Serviços Empresariais",
    description: "Soluções completas para empresas e imobiliárias",
    importance:
      "Empresas precisam de serviços especializados, laudos técnicos e atendimento diferenciado para garantir compliance e segurança.",
    howNowHelps:
      "A NOW oferece serviços corporativos com laudos técnicos, projetos personalizados, vistoria para entrega de imóveis e adequação para seguradoras.",
    services: [
      "Vistoria técnica",
      "Laudo técnico",
      "Projeto de segurança",
      "Modernização de sistemas",
      "Adequação para seguradora",
    ],
    benefits: [
      "Atendimento corporativo",
      "Laudos e projetos",
      "Contratos personalizados",
      "Gestão de múltiplos imóveis",
    ],
  },
}

interface PageProps {
  params: Promise<{ serviceId: string }>
}

export default async function ServiceCategoryPage({ params }: PageProps) {
  const { serviceId } = await params
  const category = categoriesData[serviceId as keyof typeof categoriesData]

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader />

      <main>
        {/* Header com botão voltar */}
        <div className="bg-background px-4 py-4 border-b border-border">
          <Link href="/search" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <ServiceCategoryDetail category={category} />
      </main>

      <BottomNav />
    </div>
  )
}
