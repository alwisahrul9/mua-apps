"use client";

import {
  type ChangeEvent,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, User, Phone, Users, Sparkles, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createBooking, getServices } from "@/app/(main)/booking/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyFormValues = {
  clientName: "",
  whatsapp: "",
  instagram: "",
  totalPerson: "",
  serviceId: "",
  eventName: "",
  eventDate: "",
  eventTime: "",
  location: "",
  notes: "",
};

type BookingFormField = keyof typeof emptyFormValues;

export default function BookingPage({ slug }: { slug: string }) {
  const [state, formAction, isPending] = useActionState(createBooking, null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("error") === "expired";
  const [services, setServices] = useState<{ id: string, name: string, price: number }[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [formValues, setFormValues] = useState(emptyFormValues);

  const updateField =
    (field: BookingFormField) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  useEffect(() => {
    // Fetch services
    const fetchServices = async () => {
      try {
        const data = await getServices(slug);
        setServices(data);
      } catch (e) {
        console.error("Gagal memuat layanan:", e);
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, [slug]);

  useEffect(() => {
    if (!state?.redirectTo) return;
    router.replace(state.redirectTo);
  }, [router, state?.redirectTo]);

  const isRedirecting = Boolean(state?.redirectTo);

  return (
    <div className="min-h-dvh pt-24 pb-12 px-4 container-custom">
      <Link href={slug ? `/${slug}` : "/"} className="inline-flex items-center text-muted-foreground-dark hover:text-foreground-dark transition-colors mb-8 text-sm">
        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
        Kembali ke Beranda
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Formulir Booking</h1>
          <p className="text-muted-foreground-dark">Silakan lengkapi data berikut untuk menjadwalkan layanan makeup Anda.</p>
        </div>

        {isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Waktu Pembayaran Habis</h3>
              <p className="text-sm opacity-90 mt-1">Batas waktu pembayaran untuk booking sebelumnya telah berakhir. Silakan isi kembali formulir di bawah ini untuk membuat booking baru.</p>
            </div>
          </motion.div>
        )}

        {state?.message && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-8 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{state.message}</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-dark border border-foreground-dark/10 rounded-3xl p-6 shadow-sm"
        >
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="muaSlug" value={slug} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                  <Input required name="clientName" type="text" value={formValues.clientName} onChange={updateField("clientName")} className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all" placeholder="Nama Anda" />
                </div>
                {state?.errors?.clientName && <p className="text-red-500 text-xs mt-1">{state.errors.clientName[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nomor WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                  <Input required name="whatsapp" type="tel" value={formValues.whatsapp} onChange={updateField("whatsapp")} className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all" placeholder="081234567890" />
                </div>
                {state?.errors?.whatsapp && <p className="text-red-500 text-xs mt-1">{state.errors.whatsapp[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Username Instagram (Opsional)</Label>
                <div className="relative">
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path fill="currentColor" fillRule="evenodd" d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" clipRule="evenodd" />
                  </svg>
                  <Input name="instagram" type="text" value={formValues.instagram} onChange={updateField("instagram")} className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all" placeholder="@username" />
                </div>
                {state?.errors?.instagram && <p className="text-red-500 text-xs mt-1">{state.errors.instagram[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Jumlah Orang</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                  <Input required name="totalPerson" type="number" min="1" value={formValues.totalPerson} onChange={updateField("totalPerson")} className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all" placeholder="1" />
                </div>
                {state?.errors?.totalPerson && <p className="text-red-500 text-xs mt-1">{state.errors.totalPerson[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Layanan Makeup</Label>
                <div className="relative">
                  <select required disabled={isLoadingServices || services.length === 0} name="serviceId" value={formValues.serviceId} onChange={updateField("serviceId")} className="w-full pl-4 pr-10 py-3 h-auto rounded-xl border border-foreground-dark/20 bg-transparent text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/50 transition-all appearance-none disabled:opacity-50">
                    <option value="" className="text-foreground-dark bg-background-dark">
                      {isLoadingServices
                        ? "Memuat layanan..."
                        : services.length === 0
                          ? "Belum ada layanan tersedia"
                          : "Pilih Layanan"}
                    </option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id} className="text-foreground-dark bg-background-dark">
                        {service.name} - Rp {service.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground-dark pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
                {state?.errors?.serviceId && <p className="text-red-500 text-xs mt-1">{state.errors.serviceId[0]}</p>}
                <p className="text-xs text-foreground-dark/50 mt-1">
                  *Harga belum termasuk ongkos transportasi, dan/atau biaya lainnya.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Jenis Acara</Label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                  <Input required name="eventName" type="text" value={formValues.eventName} onChange={updateField("eventName")} className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all" placeholder="Misal: Lamaran, Akad, Pesta" />
                </div>
                {state?.errors?.eventName && <p className="text-red-500 text-xs mt-1">{state.errors.eventName[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tanggal Acara</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                  <Input required name="eventDate" type="date" value={formValues.eventDate} onChange={updateField("eventDate")} className="w-full pl-10 pr-4 py-3 h-auto min-h-11 rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all appearance-none cursor-pointer" />
                </div>
                {state?.errors?.eventDate && <p className="text-red-500 text-xs mt-1">{state.errors.eventDate[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Waktu Acara</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                  <Input required name="eventTime" type="time" value={formValues.eventTime} onChange={updateField("eventTime")} className="w-full pl-10 pr-4 py-3 h-auto min-h-11 rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all appearance-none cursor-pointer" />
                </div>
                {state?.errors?.eventTime && <p className="text-red-500 text-xs mt-1">{state.errors.eventTime[0]}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Lokasi / Alamat</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                <Input required name="location" type="text" value={formValues.location} onChange={updateField("location")} className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all" placeholder="Kota atau alamat lengkap" />
              </div>
              {state?.errors?.location && <p className="text-red-500 text-xs mt-1">{state.errors.location[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Catatan Tambahan (Opsional)</Label>
              <textarea name="notes" rows={3} value={formValues.notes} onChange={updateField("notes")} className="w-full px-4 py-3 rounded-xl border border-foreground-dark/20 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark/50 transition-all resize-none" placeholder="Ada permintaan khusus?" />
              {state?.errors?.notes && <p className="text-red-500 text-xs mt-1">{state.errors.notes[0]}</p>}
            </div>

            <Button
              disabled={isPending || isRedirecting}
              type="submit"
              className="w-full py-6 bg-foreground-dark text-background-dark rounded-full font-medium transition-all hover:bg-foreground-dark/90 flex items-center justify-center disabled:opacity-70"
            >
              {isPending || isRedirecting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-background-dark/30 border-t-background rounded-full animate-spin"></span>
                  {isRedirecting ? "Membuka halaman sukses..." : "Memproses..."}
                </span>
              ) : (
                "Lanjut ke Pembayaran"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
