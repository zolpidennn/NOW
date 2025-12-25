/**
 * Integration with BrasilAPI for CNPJ validation
 * https://brasilapi.com.br/docs#tag/CNPJ
 */

export interface CNPJData {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  cnae_fiscal: string
  cnae_fiscal_descricao: string
  situacao_cadastral: string
  data_situacao_cadastral: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  ddd_telefone_1: string
  email: string
}

/**
 * Validate CNPJ with Receita Federal via BrasilAPI
 */
export async function validateCNPJWithReceitaFederal(cnpj: string): Promise<{
  success: boolean
  data?: CNPJData
  error?: string
}> {
  try {
    const cleanedCNPJ = cnpj.replace(/\D/g, "")

    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanedCNPJ}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: "CNPJ não encontrado na Receita Federal",
        }
      }

      return {
        success: false,
        error: "Erro ao consultar CNPJ. Tente novamente mais tarde.",
      }
    }

    const data: CNPJData = await response.json()

    // Check if CNPJ is active
    if (data.situacao_cadastral !== "ATIVA") {
      return {
        success: false,
        error: `CNPJ com situação cadastral: ${data.situacao_cadastral}. Apenas CNPJs ativos podem se cadastrar.`,
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("[v0] Error validating CNPJ:", error)
    return {
      success: false,
      error: "Erro ao validar CNPJ. Verifique sua conexão e tente novamente.",
    }
  }
}

/**
 * Check if CNAE is compatible with the marketplace services
 */
export function isCNAECompatible(cnae: string): boolean {
  // List of compatible CNAEs for security, electrical, IT services
  const compatibleCNAEs = [
    "8011", // Atividades de vigilância e segurança privada
    "8012", // Atividades de transporte de valores
    "4321", // Instalação e manutenção elétrica
    "4329", // Outras obras de instalações em construções
    "6201", // Desenvolvimento de programas de computador sob encomenda
    "6202", // Desenvolvimento e licenciamento de programas de computador customizáveis
    "6203", // Desenvolvimento e licenciamento de programas de computador não customizáveis
    "6204", // Consultoria em tecnologia da informação
    "8020", // Atividades de monitoramento de sistemas de segurança
    "3321", // Instalação de máquinas e equipamentos industriais
    "3329", // Instalação de equipamentos não especificados anteriormente
    "4313", // Obras de terraplenagem
    "4399", // Serviços especializados para construção não especificados anteriormente
    "7490", // Outras atividades profissionais, científicas e técnicas não especificadas anteriormente
  ]

  // Check if CNAE starts with any compatible code
  return compatibleCNAEs.some((code) => cnae.startsWith(code))
}
