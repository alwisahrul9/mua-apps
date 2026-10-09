const DATABASE_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/

export function timeInputValue(value: string) {
  const match = DATABASE_TIME_PATTERN.exec(value)
  return match ? `${match[1]}:${match[2]}` : ""
}

export function formatEventTime(value: string) {
  const inputValue = timeInputValue(value)
  return inputValue ? inputValue.replace(":", ".") : value
}

export function databaseTimeValue(value: string) {
  const inputValue = timeInputValue(value)
  return inputValue ? `${inputValue}:00` : value
}
