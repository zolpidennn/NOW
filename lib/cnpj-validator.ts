/**
 * CNPJ Validation Utilities
 * Implements technical validation and formatting for Brazilian CNPJ
 */

/**
 * Remove non-numeric characters from CNPJ
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, "")
}

/**
 * Format CNPJ with mask: XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cleanCNPJ(cnpj)
  if (cleaned.length !== 14) return cnpj

  return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
}

/**
 * Validate CNPJ check digits (mathematical validation)
 */
export function validateCNPJCheckDigits(cnpj: string): boolean {
  const cleaned = cleanCNPJ(cnpj)

  // Must have 14 digits
  if (cleaned.length !== 14) return false

  // Check for known invalid patterns
  const invalidPatterns = [
    "00000000000000",
    "11111111111111",
    "22222222222222",
    "33333333333333",
    "44444444444444",
    "55555555555555",
    "66666666666666",
    "77777777777777",
    "88888888888888",
    "99999999999999",
  ]

  if (invalidPatterns.includes(cleaned)) return false

  // Validate first check digit
  let sum = 0
  let weight = 5

  for (let i = 0; i < 12; i++) {
    sum += Number.parseInt(cleaned[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }

  const checkDigit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)

  if (checkDigit1 !== Number.parseInt(cleaned[12])) return false

  // Validate second check digit
  sum = 0
  weight = 6

  for (let i = 0; i < 13; i++) {
    sum += Number.parseInt(cleaned[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }

  const checkDigit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)

  return checkDigit2 === Number.parseInt(cleaned[13])
}

/**
 * Full CNPJ validation (format + check digits)
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cleanCNPJ(cnpj)
  return cleaned.length === 14 && validateCNPJCheckDigits(cleaned)
}

/**
 * Get validation error message
 */
export function getCNPJValidationError(cnpj: string): string | null {
  const cleaned = cleanCNPJ(cnpj)

  if (!cnpj || cnpj.trim() === "") {
    return "CNPJ é obrigatório"
  }

  if (cleaned.length !== 14) {
    return "CNPJ deve ter 14 dígitos"
  }

  if (!validateCNPJCheckDigits(cleaned)) {
    return "CNPJ inválido"
  }

  return null
}
