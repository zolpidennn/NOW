/**
 * CPF Validation Utilities
 * Implements technical validation and formatting for Brazilian CPF
 */

/**
 * Remove non-numeric characters from CPF
 */
export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, "")
}

/**
 * Format CPF with mask: XXX.XXX.XXX-XX
 */
export function formatCPF(cpf: string): string {
  const cleaned = cleanCPF(cpf)
  if (cleaned.length !== 11) return cpf

  return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
}

/**
 * Validate CPF check digits
 */
export function validateCPFCheckDigits(cpf: string): boolean {
  const cleaned = cleanCPF(cpf)

  if (cleaned.length !== 11) return false

  // Check for known invalid patterns
  const invalidPatterns = [
    "00000000000",
    "11111111111",
    "22222222222",
    "33333333333",
    "44444444444",
    "55555555555",
    "66666666666",
    "77777777777",
    "88888888888",
    "99999999999",
  ]

  if (invalidPatterns.includes(cleaned)) return false

  // Validate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cleaned[i]) * (10 - i)
  }

  let checkDigit1 = (sum * 10) % 11
  if (checkDigit1 === 10) checkDigit1 = 0

  if (checkDigit1 !== Number.parseInt(cleaned[9])) return false

  // Validate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cleaned[i]) * (11 - i)
  }

  let checkDigit2 = (sum * 10) % 11
  if (checkDigit2 === 10) checkDigit2 = 0

  return checkDigit2 === Number.parseInt(cleaned[10])
}

/**
 * Full CPF validation
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cleanCPF(cpf)
  return cleaned.length === 11 && validateCPFCheckDigits(cleaned)
}

/**
 * Get validation error message
 */
export function getCPFValidationError(cpf: string): string | null {
  const cleaned = cleanCPF(cpf)

  if (!cpf || cpf.trim() === "") {
    return "CPF é obrigatório"
  }

  if (cleaned.length !== 11) {
    return "CPF deve ter 11 dígitos"
  }

  if (!validateCPFCheckDigits(cleaned)) {
    return "CPF inválido"
  }

  return null
}
