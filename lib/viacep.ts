// ViaCEP API integration for Brazilian postal codes

export type ViaCEPResponse = {
  cep: string
  logradouro: string // street
  complemento: string // complement
  bairro: string // neighborhood
  localidade: string // city
  uf: string // state
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export async function fetchAddressByCEP(cep: string): Promise<ViaCEPResponse | null> {
  try {
    const cleanCEP = cep.replace(/\D/g, "")

    if (cleanCEP.length !== 8) {
      return null
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)

    if (!response.ok) {
      return null
    }

    const data: ViaCEPResponse = await response.json()

    if (data.erro) {
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] Error fetching CEP:", error)
    return null
  }
}

export function formatCEP(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 9)
}
