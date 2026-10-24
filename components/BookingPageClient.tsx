"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  MapPin,
  User,
  Phone,
  Users,
  Sparkles,
  Clock,
  AlertCircle,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { createBooking, getServices } from "@/app/(main)/booking/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AddOn, Service } from "@/lib/api/types";

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

const bookingFieldOrder = [
  "clientName",
  "whatsapp",
  "instagram",
  "totalPerson",
  "serviceId",
  "addOns",
  "eventName",
  "eventDate",
  "eventTime",
  "location",
  "notes",
] as const;

export default function BookingPage({ slug }: { slug: string }) {
  const [state, formAction, isPending] = useActionState(createBooking, null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("error") === "expired";
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedSubmit = useRef(false);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [formValues, setFormValues] = useState(emptyFormValues);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>(
    {},
  );
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const selectedService = useMemo(
    () => services.find((service) => service.id === formValues.serviceId),
    [formValues.serviceId, services],
  );
  const availableAddOns = useMemo(
    () =>
      (selectedService?.addOns ?? []).filter(
        (addOn) => addOn.isActive !== false,
      ),
    [selectedService],
  );
  const selectedAddOnDetails = useMemo(
    () =>
      availableAddOns.flatMap((addOn) => {
        const quantity = selectedAddOns[addOn.id];
        return quantity ? [{ addOn, quantity }] : [];
      }),
    [availableAddOns, selectedAddOns],
  );
  const serviceSubtotal = selectedService
    ? Number(selectedService.price) *
      Math.max(1, Number(formValues.totalPerson) || 1)
    : 0;
  const addOnSubtotal = selectedAddOnDetails.reduce(
    (total, { addOn, quantity }) => total + Number(addOn.price) * quantity,
    0,
  );

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

  useEffect(() => {
    if (!state?.errors) return;

    const firstInvalidField = bookingFieldOrder.find(
      (field) => state.errors?.[field]?.length,
    );
    if (!firstInvalidField) return;

    const target =
      firstInvalidField === "addOns"
        ? formRef.current?.querySelector<HTMLElement>("[data-field='addOns']")
        : formRef.current?.querySelector<HTMLElement>(
            `[name='${firstInvalidField}']`,
          );

    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    ) {
      target.focus({ preventScroll: true });
    }
  }, [state]);

  const isRedirecting = Boolean(state?.redirectTo);
  const formLocked = isPending || isRedirecting;

  function updateService(event: ChangeEvent<HTMLSelectElement>) {
    setFormValues((current) => ({ ...current, serviceId: event.target.value }));
    setSelectedAddOns({});
  }

  function toggleAddOn(addOn: AddOn) {
    setSelectedAddOns((current) => {
      if (current[addOn.id]) {
        const next = { ...current };
        delete next[addOn.id];
        return next;
      }
      return { ...current, [addOn.id]: 1 };
    });
  }

  function updateAddOnQuantity(addOn: AddOn, quantity: number) {
    if (addOn.billingType !== "per_unit") return;
    setSelectedAddOns((current) => ({
      ...current,
      [addOn.id]: Math.min(999, Math.max(1, quantity)),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (confirmedSubmit.current) {
      confirmedSubmit.current = false;
      return;
    }
    event.preventDefault();
    if (formRef.current?.reportValidity()) setConfirmationOpen(true);
  }

  function confirmBooking() {
    confirmedSubmit.current = true;
    setConfirmationOpen(false);
    formRef.current?.requestSubmit();
  }

  const bookingAddOns = JSON.stringify(
    selectedAddOnDetails.map(({ addOn, quantity }) => ({
      addon_id: addOn.id,
      quantity: addOn.billingType === "flat" ? 1 : quantity,
    })),
  );

  return (
    <div className="min-h-dvh pt-24 pb-12 px-4 container-custom">
      <Link
        href={slug ? `/${slug}` : "/"}
        className="inline-flex items-center text-muted-foreground-dark hover:text-foreground-dark transition-colors mb-8 text-sm"
      >
        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
        Kembali ke Beranda
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">
            Formulir Booking
          </h1>
          <p className="text-muted-foreground-dark">
            Silakan lengkapi data berikut untuk menjadwalkan layanan makeup
            Anda.
          </p>
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
              <p className="text-sm opacity-90 mt-1">
                Batas waktu pembayaran untuk booking sebelumnya telah berakhir.
                Silakan isi kembali formulir di bawah ini untuk membuat booking
                baru.
              </p>
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
          <form
            ref={formRef}
            action={formAction}
            onSubmit={handleSubmit}
            aria-busy={formLocked}
          >
            <fieldset
              disabled={formLocked}
              className="space-y-6 border-0 p-0 disabled:cursor-wait disabled:opacity-70"
            >
              <input type="hidden" name="muaSlug" value={slug} />
              <input type="hidden" name="addOns" value={bookingAddOns} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                  <Input
                    required
                    name="clientName"
                    type="text"
                    value={formValues.clientName}
                    onChange={updateField("clientName")}
                    aria-invalid={Boolean(state?.errors?.clientName)}
                    className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all"
                    placeholder="Nama Anda"
                  />
                </div>
                {state?.errors?.clientName && (
                  <p className="text-red-500 text-xs mt-1">
                    {state.errors.clientName[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nomor WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                  <Input
                    required
                    name="whatsapp"
                    type="tel"
                    value={formValues.whatsapp}
                    onChange={updateField("whatsapp")}
                    aria-invalid={Boolean(state?.errors?.whatsapp)}
                    className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all"
                    placeholder="081234567890"
                  />
                </div>
                {state?.errors?.whatsapp && (
                  <p className="text-red-500 text-xs mt-1">
                    {state.errors.whatsapp[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Username Instagram (Opsional)
                </Label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <Input
                    name="instagram"
                    type="text"
                    value={formValues.instagram}
                    onChange={updateField("instagram")}
                    aria-invalid={Boolean(state?.errors?.instagram)}
                    className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all"
                    placeholder="@username"
                  />
                </div>
                {state?.errors?.instagram && (
                  <p className="text-red-500 text-xs mt-1">
                    {state.errors.instagram[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Jumlah Orang</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                  <Input
                    required
                    name="totalPerson"
                    type="number"
                    min="1"
                    value={formValues.totalPerson}
                    onChange={updateField("totalPerson")}
                    aria-invalid={Boolean(state?.errors?.totalPerson)}
                    className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all"
                    placeholder="1"
                  />
                </div>
                {state?.errors?.totalPerson && (
                  <p className="text-red-500 text-xs mt-1">
                    {state.errors.totalPerson[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Layanan Makeup</Label>
                <div className="relative">
                  <select
                    required
                    disabled={
                      formLocked || isLoadingServices || services.length === 0
                    }
                    name="serviceId"
                    value={formValues.serviceId}
                    onChange={updateService}
                    aria-invalid={Boolean(state?.errors?.serviceId)}
                    className="w-full pl-4 pr-10 py-3 h-auto rounded-xl border border-foreground-dark/20 bg-transparent text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/50 transition-all appearance-none disabled:opacity-50"
                  >
                    <option
                      value=""
                      className="text-foreground-dark bg-background-dark"
                    >
                      {isLoadingServices
                        ? "Memuat layanan..."
                        : services.length === 0
                          ? "Belum ada layanan tersedia"
                          : "Pilih Layanan"}
                    </option>
                    {services.map((service) => (
                      <option
                        key={service.id}
                        value={service.id}
                        className="text-foreground-dark bg-background-dark"
                      >
                        {service.name} - Rp{" "}
                        {Number(service.price).toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground-dark pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
                {state?.errors?.serviceId && (
                  <p className="text-red-500 text-xs mt-1">
                    {state.errors.serviceId[0]}
                  </p>
                )}
                <p className="text-xs text-foreground-dark/50 mt-1">
                  *Harga belum termasuk ongkos transportasi, dan/atau biaya
                  lainnya.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Jenis Acara</Label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                  <Input
                    required
                    name="eventName"
                    type="text"
                    value={formValues.eventName}
                    onChange={updateField("eventName")}
                    aria-invalid={Boolean(state?.errors?.eventName)}
                    className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all"
                    placeholder="Misal: Lamaran, Akad, Pesta"
                  />
                </div>
                {state?.errors?.eventName && (
                  <p className="text-red-500 text-xs mt-1">
                    {state.errors.eventName[0]}
                  </p>
                )}
              </div>
            </div>

            {selectedService && (
              <div
                data-field="addOns"
                tabIndex={-1}
                className="space-y-2 outline-none"
              >
                {availableAddOns.length > 0 && (
                  <section
                    className={`space-y-4 rounded-2xl border p-4 outline-none sm:p-5 ${
                      state?.errors?.addOns
                        ? "border-red-500/60 ring-2 ring-red-500/20"
                        : "border-foreground-dark/10"
                    }`}
                  >
                    <div>
                      <h2 className="font-medium text-foreground-dark">
                        Add-on Layanan
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground-dark">
                        Pilih tambahan yang dibutuhkan.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {availableAddOns.map((addOn) => {
                        const selected = Boolean(selectedAddOns[addOn.id]);
                        const quantity = selectedAddOns[addOn.id] ?? 1;

                        return (
                          <div
                            key={addOn.id}
                            className={`rounded-2xl border p-4 transition-colors ${
                              selected
                                ? "border-primary-dark bg-primary-dark/10"
                                : "border-foreground-dark/10"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                aria-pressed={selected}
                                onClick={() => toggleAddOn(addOn)}
                                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark/50 disabled:cursor-wait disabled:opacity-50 ${
                                  selected
                                    ? "border-primary-dark bg-primary-dark text-primary-foreground-dark"
                                    : "border-foreground-dark/30"
                                }`}
                                aria-label={`${selected ? "Hapus" : "Pilih"} add-on ${addOn.name}`}
                              >
                                {selected && <span aria-hidden="true">✓</span>}
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleAddOn(addOn)}
                                className="min-w-0 flex-1 text-left focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
                              >
                                <span className="block font-medium text-foreground-dark">
                                  {addOn.name}
                                </span>
                                {addOn.description && (
                                  <span className="mt-1 block text-xs leading-5 text-muted-foreground-dark">
                                    {addOn.description}
                                  </span>
                                )}
                                <span className="mt-2 block text-sm font-medium text-primary-dark">
                                  Rp{" "}
                                  {Number(addOn.price).toLocaleString("id-ID")}
                                  {addOn.billingType === "per_unit"
                                    ? ` / ${addOn.unit === "hourly" ? "jam" : addOn.unit === "person" ? "orang" : "item"}`
                                    : " · Biaya Tetap"}
                                </span>
                              </button>
                            </div>

                            {selected && addOn.billingType === "per_unit" && (
                              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-foreground-dark/10 pt-3">
                                <span className="text-xs text-muted-foreground-dark">
                                  Kuantitas
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateAddOnQuantity(addOn, quantity - 1)
                                    }
                                    disabled={quantity <= 1}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground-dark/20 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label={`Kurangi kuantitas ${addOn.name}`}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="999"
                                    inputMode="numeric"
                                    value={quantity}
                                    onChange={(event) =>
                                      updateAddOnQuantity(
                                        addOn,
                                        Number(event.target.value) || 1,
                                      )
                                    }
                                    aria-label={`Kuantitas ${addOn.name}`}
                                    className="h-9 w-16 rounded-xl px-2 text-center"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateAddOnQuantity(addOn, quantity + 1)
                                    }
                                    disabled={quantity >= 999}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground-dark/20 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label={`Tambah kuantitas ${addOn.name}`}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
                {state?.errors?.addOns && (
                  <p className="text-xs text-red-500">
                    {state.errors.addOns[0]}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tanggal Acara</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                  <Input
                    required
                    name="eventDate"
                    type="date"
                    value={formValues.eventDate}
                    onChange={updateField("eventDate")}
                    aria-invalid={Boolean(state?.errors?.eventDate)}
                    className="w-full pl-10 pr-4 py-3 h-auto min-h-11 rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all appearance-none cursor-pointer"
                  />
                </div>
                {state?.errors?.eventDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {state.errors.eventDate[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Waktu Acara</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                  <Input
                    required
                    name="eventTime"
                    type="time"
                    value={formValues.eventTime}
                    onChange={updateField("eventTime")}
                    aria-invalid={Boolean(state?.errors?.eventTime)}
                    className="w-full pl-10 pr-4 py-3 h-auto min-h-11 rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all appearance-none cursor-pointer"
                  />
                </div>
                {state?.errors?.eventTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {state.errors.eventTime[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Lokasi / Alamat</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground-dark" />
                <Input
                  required
                  name="location"
                  type="text"
                  value={formValues.location}
                  onChange={updateField("location")}
                  aria-invalid={Boolean(state?.errors?.location)}
                  className="w-full pl-10 pr-4 py-3 h-auto rounded-xl border-foreground-dark/20 bg-transparent focus-visible:ring-primary-dark/50 transition-all"
                  placeholder="Kota atau alamat lengkap"
                />
              </div>
              {state?.errors?.location && (
                <p className="text-red-500 text-xs mt-1">
                  {state.errors.location[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Catatan Tambahan (Opsional)
              </Label>
              <textarea
                name="notes"
                rows={3}
                value={formValues.notes}
                onChange={updateField("notes")}
                aria-invalid={Boolean(state?.errors?.notes)}
                className="w-full px-4 py-3 rounded-xl border border-foreground-dark/20 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark/50 transition-all resize-none"
                placeholder="Ada permintaan khusus?"
              />
              {state?.errors?.notes && (
                <p className="text-red-500 text-xs mt-1">
                  {state.errors.notes[0]}
                </p>
              )}
            </div>

            <Button
              disabled={formLocked}
              type="submit"
              className="w-full py-6 bg-foreground-dark text-background-dark rounded-full font-medium transition-all hover:bg-foreground-dark/90 flex items-center justify-center disabled:opacity-70"
            >
              {isPending || isRedirecting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-background-dark/30 border-t-background rounded-full animate-spin"></span>
                  {isRedirecting ? "Membuka halaman sukses..." : "Memproses..."}
                </span>
              ) : (
                "Tinjau Pesanan"
              )}
            </Button>
            </fieldset>
          </form>

          <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
            <DialogContent className="max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-xl">
              <DialogHeader className="border-b border-foreground/10 px-5 py-5 pr-14 dark:border-foreground-dark/10 sm:px-6">
                <DialogTitle className="font-serif text-xl">
                  Konfirmasi Pesanan
                </DialogTitle>
                <DialogDescription>
                  Periksa kembali seluruh rincian sebelum melanjutkan ke
                  pembayaran.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 overflow-y-auto px-5 py-3 sm:px-6">
                <section className="grid gap-3 rounded-2xl border border-foreground/10 p-4 text-sm dark:border-foreground-dark/10 sm:grid-cols-2">
                  <ConfirmationItem
                    label="Nama Klien"
                    value={formValues.clientName}
                  />
                  <ConfirmationItem
                    label="WhatsApp"
                    value={formValues.whatsapp}
                  />
                  <ConfirmationItem
                    label="Instagram"
                    value={formValues.instagram || "Tidak diisi"}
                  />
                  <ConfirmationItem
                    label="Jumlah Orang"
                    value={formValues.totalPerson}
                  />
                </section>

                <section className="space-y-3">
                  <h3 className="flex items-center gap-2 font-medium">
                    <ShoppingBag className="h-4 w-4" />
                    Layanan dan Add-on
                  </h3>
                  <div className="space-y-3 rounded-2xl border border-foreground/10 p-4 dark:border-foreground-dark/10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{selectedService?.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Rp{" "}
                          {Number(selectedService?.price ?? 0).toLocaleString(
                            "id-ID",
                          )}{" "}
                          × {Math.max(1, Number(formValues.totalPerson) || 1)}{" "}
                          orang
                        </p>
                      </div>
                      <p className="shrink-0 font-medium">
                        Rp {serviceSubtotal.toLocaleString("id-ID")}
                      </p>
                    </div>

                    {selectedAddOnDetails.length > 0 ? (
                      <div className="space-y-3 border-t border-foreground/10 pt-3 dark:border-foreground-dark/10">
                        {selectedAddOnDetails.map(({ addOn, quantity }) => (
                          <div
                            key={addOn.id}
                            className="flex items-start justify-between gap-4 text-sm"
                          >
                            <div>
                              <p>{addOn.name}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Rp {Number(addOn.price).toLocaleString("id-ID")}
                                {addOn.billingType === "per_unit"
                                  ? ` × ${quantity}`
                                  : " · Flat"}
                              </p>
                            </div>
                            <p className="shrink-0">
                              Rp{" "}
                              {(Number(addOn.price) * quantity).toLocaleString(
                                "id-ID",
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="border-t border-foreground/10 pt-3 text-xs text-muted-foreground dark:border-foreground-dark/10">
                        Tidak ada add-on yang dipilih.
                      </p>
                    )}

                    <div className="flex items-center justify-between border-t border-foreground/10 pt-3 font-semibold dark:border-foreground-dark/10">
                      <span>Estimasi Total</span>
                      <span>
                        Rp{" "}
                        {(serviceSubtotal + addOnSubtotal).toLocaleString(
                          "id-ID",
                        )}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="grid gap-3 rounded-2xl border border-foreground/10 p-4 text-sm dark:border-foreground-dark/10 sm:grid-cols-2">
                  <ConfirmationItem
                    label="Jenis Acara"
                    value={formValues.eventName}
                  />
                  <ConfirmationItem
                    label="Tanggal Acara"
                    value={
                      formValues.eventDate
                        ? new Date(
                            `${formValues.eventDate}T00:00:00`,
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"
                    }
                  />
                  <ConfirmationItem
                    label="Waktu Acara"
                    value={formValues.eventTime}
                  />
                  <ConfirmationItem
                    label="Lokasi"
                    value={formValues.location}
                  />
                  <div className="sm:col-span-2">
                    <ConfirmationItem
                      label="Catatan"
                      value={formValues.notes || "Tidak ada catatan"}
                    />
                  </div>
                </section>

                <p className="text-xs leading-5 text-muted-foreground">
                  Estimasi belum termasuk ongkos transportasi atau biaya
                  tambahan lain yang ditentukan MUA.
                </p>
              </div>

              <DialogFooter className="border-t border-foreground/10 p-5 dark:border-foreground-dark/10 sm:px-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmationOpen(false)}
                  disabled={isPending}
                  className="h-11 rounded-full"
                >
                  Kembali Edit
                </Button>
                <Button
                  type="button"
                  onClick={confirmBooking}
                  disabled={formLocked}
                  className="h-11 rounded-full"
                >
                  {formLocked ? "Memproses..." : "Lanjut ke Pembayaran"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
}

function ConfirmationItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-medium">{value || "-"}</p>
    </div>
  );
}
