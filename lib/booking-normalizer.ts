import type { Booking, BookingAddOn } from "@/lib/api/types"

function numericValue(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue
    const number = Number(value)
    if (Number.isFinite(number)) return number
  }
  return 0
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {}
}

function normalizeBookingAddOns(booking: Record<string, unknown>) {
  const priceBreakdown = objectValue(booking.priceBreakdown)
  const candidates =
    booking.addOns ?? booking.addons ?? booking.bookingAddOns ??
    booking.bookingAddons ?? priceBreakdown.addOns ?? priceBreakdown.addons

  if (!Array.isArray(candidates)) return []

  return candidates.flatMap<BookingAddOn>((candidate, index) => {
    const item = objectValue(candidate)
    const addOn = objectValue(item.addOn ?? item.addon)
    const pivot = objectValue(item.pivot)
    const source = Object.keys(addOn).length > 0 ? addOn : item
    const quantity = Math.max(1, numericValue(item.quantity, pivot.quantity, 1))
    const unitPrice = numericValue(
      item.unitPrice, item.priceAtBooking, item.addonPrice,
      pivot.unitPrice, pivot.priceAtBooking, pivot.price, source.price, item.price,
    )
    const billingType = source.billingType ?? item.billingType
    const unit = source.unit ?? item.unit

    return [{
      id: String(source.id ?? item.addonId ?? item.addOnId ?? `addon-${index}`),
      name: String(source.name ?? item.addonName ?? item.name ?? "Add-on"),
      quantity,
      unitPrice,
      subtotal: numericValue(
        item.subtotal, item.totalPrice, item.total, pivot.subtotal,
        unitPrice * quantity,
      ),
      ...(billingType === "flat" || billingType === "per_unit" ? { billingType } : {}),
      ...(unit === "item" || unit === "hourly" || unit === "person" || unit === null
        ? { unit }
        : {}),
    }]
  })
}

export function normalizeBookingRecord(booking: Record<string, unknown>) {
  const priceBreakdown = objectValue(booking.priceBreakdown)
  const serviceBreakdown = objectValue(priceBreakdown.service)
  const service = objectValue(booking.service)
  const totalPerson = Math.max(1, numericValue(booking.totalPerson, 1))
  const servicePrice = numericValue(
    booking.servicePrice, serviceBreakdown.unitPrice,
    serviceBreakdown.price, service.price,
  )
  const addOns = normalizeBookingAddOns(booking)
  const addOnSubtotal = addOns.reduce((total, addOn) => total + addOn.subtotal, 0)
  const totalPrice = numericValue(booking.totalPrice)
  const recordedServiceSubtotal = numericValue(
    booking.serviceSubtotal,
    serviceBreakdown.subtotal,
    servicePrice * totalPerson,
  )

  return {
    ...booking,
    totalPerson,
    totalPrice,
    dpAmount: numericValue(booking.dpAmount),
    servicePrice,
    serviceSubtotal:
      recordedServiceSubtotal > 0
        ? recordedServiceSubtotal
        : Math.max(0, totalPrice - addOnSubtotal),
    addOns,
  } as Booking
}
