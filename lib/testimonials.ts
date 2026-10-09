export type Testimonial = {
  name: string
  service: string
  quote: string
}

// Masukkan hanya testimoni asli yang sudah mendapat izin untuk dipublikasikan.
// Bagian testimoni di beranda otomatis tampil setelah array ini diisi.
export const testimonials: Testimonial[] = []

