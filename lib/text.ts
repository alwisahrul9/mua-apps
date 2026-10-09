export function toTitleCase(value: string): string {
  const normalized = value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("id-ID")

  return normalized.replace(
    /(^|[\s-])(\p{L})/gu,
    (_match, boundary: string, letter: string) =>
      `${boundary}${letter.toLocaleUpperCase("id-ID")}`,
  )
}
