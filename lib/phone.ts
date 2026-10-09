export function normalizeWhatsappNumber(value: string): string {
  let digits = value.replace(/\D/g, "")

  if (digits.startsWith("0062")) digits = digits.slice(2)
  if (digits.startsWith("62")) return digits
  if (digits.startsWith("0")) return `62${digits.slice(1)}`
  if (digits.startsWith("8")) return `62${digits}`

  return digits
}

export function isValidWhatsappNumber(value: string): boolean {
  return /^628\d{7,11}$/.test(normalizeWhatsappNumber(value))
}
