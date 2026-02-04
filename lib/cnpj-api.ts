// ReceitaWS API integration for CNPJ lookup

export type CNPJResponse = {
  cnpj: string
  nome: string // company name
  fantasia: string // trade name
  abertura: string // opening date
  situacao: string // status
  tipo: string // type
  porte: string // size
  natureza_juridica: string
  atividade_principal: Array<{
    code: string
    text: string
  }>
  atividades_secundarias: Array<{
    code: string
    text: string
  }>
  logradouro: string // street
  numero: string // number
  complemento: string
  bairro: string // neighborhood
  municipio: string // city
  uf: string // state
  cep: string
  email: string
  telefone: string
  efr: string
  motivo_situacao: string
  situacao_especial: string
  data_situacao_especial: string
  capital_social: string
}

export async function fetchCNPJData(cnpj: string): Promise<CNPJResponse | null> {
  try {
    const cleanCNPJ = cnpj.replace(/\D/g, "")

    if (cleanCNPJ.length !== 14) {
      return null
    }

    // Using ReceitaWS - free CNPJ API
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCNPJ}`)

    if (!response.ok) {
      return null
    }

    const data: CNPJResponse = await response.json()

    if (data.situacao === "ERROR") {
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] Error fetching CNPJ:", error)
    return null
  }
}

export function formatCNPJ(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
    .slice(0, 18)
}
