"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  AtSign,
  Building2,
  ChevronDown,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import type { MuaProfile, PaymentMethod } from "@/lib/api/types";
import type { IndonesiaRegion } from "@/lib/indonesia-regions";
import { completeOnboarding } from "./actions";
import {
  onboardingSchema,
  paymentMethodSchema,
  type OnboardingValues,
  type PaymentMethodValues,
} from "./schema";
import { normalizeWhatsappNumber } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogoutDialog from "./LogoutDialog";

export default function OnboardingForm({
  profile,
  provinces,
  userName,
}: {
  profile: MuaProfile | null;
  provinces: IndonesiaRegion[];
  userName: string;
}) {
  const [state, action, pending] = useActionState(
    completeOnboarding,
    undefined,
  );
  const [username, setUsername] = useState(profile?.username ?? "");
  const [brandName, setBrandName] = useState(profile?.brandName ?? "");
  const [serviceArea, setServiceArea] = useState(profile?.serviceArea ?? []);
  const [whatsappNumber, setWhatsappNumber] = useState(
    normalizeWhatsappNumber(profile?.whatsappNumber ?? ""),
  );
  const [areaDraft, setAreaDraft] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [regencies, setRegencies] = useState<IndonesiaRegion[]>([]);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [regionError, setRegionError] = useState("");
  const [manualArea, setManualArea] = useState(provinces.length === 0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    profile?.paymentMethod ?? [],
  );
  const [paymentDraft, setPaymentDraft] = useState<PaymentMethodValues>({
    accountName: "",
    paymentName: "",
    accountNumber: "",
  });
  const [paymentDraftErrors, setPaymentDraftErrors] = useState<
    Partial<Record<keyof PaymentMethodValues, string[]>>
  >({});
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<keyof OnboardingValues, string[]>>
  >({});

  const fieldError = (field: keyof OnboardingValues) =>
    clientErrors[field]?.[0] ?? state?.errors?.[field]?.[0];

  useEffect(() => {
    if (!provinceCode) return;

    const controller = new AbortController();

    fetch(`/api/regions/regencies?province=${provinceCode}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Data wilayah tidak tersedia");
        return (await response.json()) as { data?: IndonesiaRegion[] };
      })
      .then((result) => {
        const nextRegencies = result.data ?? [];
        setRegencies(nextRegencies);
        if (nextRegencies.length === 0) setManualArea(true);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setRegencies([]);
        setManualArea(true);
        setRegionError(
          "Daftar kota/kabupaten gagal dimuat. Anda tetap dapat mengetiknya secara manual.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingRegencies(false);
      });

    return () => controller.abort();
  }, [provinceCode]);

  function addServiceArea() {
    const area = areaDraft.trim();
    if (
      !area ||
      serviceArea.some((item) => item.toLowerCase() === area.toLowerCase())
    )
      return;
    setServiceArea((current) => [...current, area]);
    setAreaDraft("");
    setClientErrors((current) => ({ ...current, serviceArea: undefined }));
  }

  function addPaymentMethod(): PaymentMethod[] | null {
    const parsed = paymentMethodSchema.safeParse(paymentDraft);
    if (!parsed.success) {
      setPaymentDraftErrors(parsed.error.flatten().fieldErrors);
      return null;
    }

    const method = {
      accountName: parsed.data.accountName,
      paymentName: parsed.data.paymentName,
      accountNumber: parsed.data.accountNumber,
    };
    const nextPaymentMethods = [...paymentMethods, method];
    setPaymentMethods(nextPaymentMethods);
    setPaymentDraft({ accountName: "", paymentName: "", accountNumber: "" });
    setPaymentDraftErrors({});
    setClientErrors((current) => ({ ...current, paymentMethods: undefined }));
    return nextPaymentMethods;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const draft = areaDraft.trim();
    const areas =
      draft &&
      !serviceArea.some((item) => item.toLowerCase() === draft.toLowerCase())
        ? [...serviceArea, draft]
        : serviceArea;
    const hasPaymentDraft = Object.values(paymentDraft).some((value) =>
      value.trim(),
    );
    const methods = hasPaymentDraft ? addPaymentMethod() : paymentMethods;
    if (methods === null) return;
    const parsed = onboardingSchema.safeParse({
      username,
      brandName,
      serviceArea: areas,
      paymentMethods: methods,
      whatsappNumber,
    });

    if (!parsed.success) {
      setClientErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setClientErrors({});
    setWhatsappNumber(parsed.data.whatsappNumber);
    if (draft) {
      setServiceArea(areas);
      setAreaDraft("");
    }

    const formData = new FormData(event.currentTarget);
    formData.set("username", parsed.data.username);
    formData.set("brandName", parsed.data.brandName);
    formData.delete("serviceArea");
    parsed.data.serviceArea.forEach((area) =>
      formData.append("serviceArea", area),
    );
    formData.set("whatsappNumber", parsed.data.whatsappNumber);
    formData.set("paymentMethods", JSON.stringify(parsed.data.paymentMethods));

    startTransition(() => action(formData));
  }

  return (
    <main className="flex min-h-dvh items-center bg-[radial-gradient(circle_at_top_right,rgba(205,170,125,0.15),transparent_38%)] px-4 py-10 text-foreground-dark">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="font-serif text-2xl">
            JadiCantik <span className="italic text-primary-dark">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-foreground-dark/10 px-4 py-2 text-xs text-muted-foreground-dark sm:inline-flex">
              Satu langkah lagi
            </span>
            <LogoutDialog />
          </div>
        </div>

        <div className="grid overflow-hidden rounded-3xl border border-foreground-dark/10 bg-background-dark shadow-xl shadow-black/5 md:grid-cols-[0.85fr_1.4fr]">
          <aside className="border-b border-foreground-dark/10 bg-primary-dark/8 p-7 md:border-b-0 md:border-r md:p-9">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-dark/15 text-primary-dark">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-primary-dark">
              Selamat datang, {userName}
            </p>
            <h1 className="mt-3 font-serif text-3xl leading-tight">
              Siapkan identitas bisnis Anda
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground-dark">
              Pilih username, lalu isi nama brand, wilayah layanan, metode
              pembayaran, dan nomor WhatsApp agar halaman MUA Anda siap
              digunakan.
            </p>

            <div className="mt-8 rounded-2xl border border-foreground-dark/10 bg-background-dark/60 p-4">
              <p className="text-xs text-muted-foreground-dark">
                Alamat halaman Anda
              </p>
              <p className="mt-1 truncate text-sm font-medium text-primary-dark">
                /{username || "username-anda"}
              </p>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-7 p-7 md:p-9"
          >
            <div>
              <h2 className="font-serif text-2xl">Profil awal MUA</h2>
              <p className="mt-1 text-sm text-muted-foreground-dark">
                Informasi lainnya dapat Anda tambahkan nanti melalui dashboard.
              </p>
            </div>

            {state?.error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground-dark" />
                <Input
                  id="username"
                  name="username"
                  value={username}
                  onChange={(event) => {
                    setUsername(
                      event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_]/g, ""),
                    );
                    setClientErrors((current) => ({
                      ...current,
                      username: undefined,
                    }));
                  }}
                  placeholder="contoh_mua"
                  autoComplete="username"
                  disabled={pending}
                  aria-invalid={Boolean(fieldError("username"))}
                  aria-describedby={
                    fieldError("username") ? "username-error" : undefined
                  }
                  className="h-11 rounded-xl pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground-dark">
                Gunakan huruf kecil, angka, atau underscore tanpa spasi.
                Username akan dipakai pada alamat halaman publik Anda.
              </p>
              {fieldError("username") && (
                <p id="username-error" className="text-xs text-red-500">
                  {fieldError("username")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandName">Nama brand</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground-dark" />
                <Input
                  id="brandName"
                  name="brandName"
                  value={brandName}
                  onChange={(event) => {
                    setBrandName(event.target.value);
                    setClientErrors((current) => ({
                      ...current,
                      brandName: undefined,
                    }));
                  }}
                  placeholder="Contoh: Aldena's Makeup"
                  autoComplete="organization"
                  disabled={pending}
                  aria-invalid={Boolean(fieldError("brandName"))}
                  aria-describedby={
                    fieldError("brandName") ? "brandName-error" : undefined
                  }
                  className="h-11 rounded-xl pl-10"
                />
              </div>
              {fieldError("brandName") && (
                <p id="brandName-error" className="text-xs text-red-500">
                  {fieldError("brandName")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Wilayah layanan</Label>
              <div className="relative">
                <select
                  id="province"
                  value={provinceCode}
                  onChange={(event) => {
                    const nextProvinceCode = event.target.value;
                    setProvinceCode(nextProvinceCode);
                    setAreaDraft("");
                    setRegencies([]);
                    setRegionError("");
                    setManualArea(provinces.length === 0);
                    setLoadingRegencies(Boolean(nextProvinceCode));
                  }}
                  disabled={pending || provinces.length === 0}
                  className="h-11 w-full appearance-none rounded-xl border border-foreground-dark/20 bg-background-dark px-3 pr-10 text-base text-foreground-dark outline-none transition [color-scheme:dark] focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  <option value="">
                    {provinces.length > 0
                      ? "Pilih provinsi"
                      : "Daftar provinsi tidak tersedia"}
                  </option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-dark" />
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  {manualArea ? (
                    <>
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground-dark" />
                      <Input
                        id="serviceAreaDraft"
                        value={areaDraft}
                        onChange={(event) => {
                          setAreaDraft(event.target.value);
                          setClientErrors((current) => ({
                            ...current,
                            serviceArea: undefined,
                          }));
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addServiceArea();
                          }
                        }}
                        placeholder="Ketik nama kota/kabupaten"
                        disabled={pending}
                        aria-invalid={Boolean(fieldError("serviceArea"))}
                        className="h-11 rounded-xl bg-background-dark pl-10 text-base md:text-sm"
                      />
                    </>
                  ) : (
                    <>
                      <select
                        id="serviceAreaDraft"
                        value={areaDraft}
                        onChange={(event) => {
                          if (event.target.value === "__manual__") {
                            setAreaDraft("");
                            setManualArea(true);
                          } else {
                            setAreaDraft(event.target.value);
                          }
                          setClientErrors((current) => ({
                            ...current,
                            serviceArea: undefined,
                          }));
                        }}
                        disabled={
                          pending ||
                          loadingRegencies ||
                          !provinceCode ||
                          regencies.length === 0
                        }
                        aria-invalid={Boolean(fieldError("serviceArea"))}
                        className="h-11 w-full appearance-none rounded-xl border border-foreground-dark/20 bg-background-dark px-3 pr-10 text-base text-foreground-dark outline-none transition [color-scheme:dark] focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      >
                        <option value="">
                          {loadingRegencies
                            ? "Memuat kota/kabupaten..."
                            : provinceCode
                              ? "Pilih kota/kabupaten"
                              : "Pilih provinsi dahulu"}
                        </option>
                        {regencies.map((regency) => (
                          <option key={regency.code} value={regency.name}>
                            {regency.name}
                          </option>
                        ))}
                        <option value="__manual__">Isi secara manual</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-dark" />
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addServiceArea}
                  disabled={pending || !areaDraft.trim()}
                  className="h-11 shrink-0 rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                  Tambah
                </Button>
              </div>
              <p className="text-xs text-muted-foreground-dark">
                Pilih kota/kabupaten dari daftar atau gunakan pilihan isi
                manual. Hanya nama kota/kabupaten yang disimpan.
              </p>
              {manualArea && provinces.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setManualArea(false);
                    setAreaDraft("");
                  }}
                  disabled={pending || !provinceCode || regencies.length === 0}
                  className="text-xs font-medium text-primary-dark underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Kembali pilih dari daftar
                </button>
              )}
              {regionError && (
                <p className="text-xs text-amber-500">{regionError}</p>
              )}

              {serviceArea.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {serviceArea.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1.5 rounded-full border border-foreground-dark/10 bg-muted-dark/50 px-3 py-1.5 text-sm"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() =>
                          setServiceArea((current) =>
                            current.filter((item) => item !== area),
                          )
                        }
                        disabled={pending}
                        className="rounded-full text-muted-foreground-dark transition hover:text-foreground-dark"
                        aria-label={`Hapus ${area}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <input type="hidden" name="serviceArea" value={area} />
                    </span>
                  ))}
                </div>
              )}

              {fieldError("serviceArea") && (
                <p className="text-xs text-red-500">
                  {fieldError("serviceArea")}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label>Metode pembayaran</Label>
                <p className="mt-1 text-xs text-muted-foreground-dark">
                  Tambahkan rekening bank atau dompet digital yang digunakan
                  untuk menerima pembayaran klien.
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-foreground-dark/10 bg-muted-dark/20 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="paymentName" className="text-xs">
                      Nama pembayaran
                    </Label>
                    <Input
                      id="paymentName"
                      value={paymentDraft.paymentName}
                      onChange={(event) => {
                        setPaymentDraft((current) => ({
                          ...current,
                          paymentName: event.target.value,
                        }));
                        setPaymentDraftErrors((current) => ({
                          ...current,
                          paymentName: undefined,
                        }));
                      }}
                      placeholder="Contoh: BCA atau GoPay"
                      disabled={pending}
                      aria-invalid={Boolean(paymentDraftErrors.paymentName)}
                      className="h-11 rounded-xl bg-background-dark text-base md:text-sm"
                    />
                    {paymentDraftErrors.paymentName?.[0] && (
                      <p className="text-xs text-red-500">
                        {paymentDraftErrors.paymentName[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="accountNumber" className="text-xs">
                      Nomor akun
                    </Label>
                    <Input
                      id="accountNumber"
                      value={paymentDraft.accountNumber}
                      onChange={(event) => {
                        setPaymentDraft((current) => ({
                          ...current,
                          accountNumber: event.target.value.replace(/\D/g, ""),
                        }));
                        setPaymentDraftErrors((current) => ({
                          ...current,
                          accountNumber: undefined,
                        }));
                      }}
                      placeholder="Contoh: 0012345678"
                      inputMode="numeric"
                      autoComplete="off"
                      disabled={pending}
                      aria-invalid={Boolean(paymentDraftErrors.accountNumber)}
                      className="h-11 rounded-xl bg-background-dark text-base md:text-sm"
                    />
                    {paymentDraftErrors.accountNumber?.[0] && (
                      <p className="text-xs text-red-500">
                        {paymentDraftErrors.accountNumber[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="accountName" className="text-xs">
                    Nama pemilik akun
                  </Label>
                  <Input
                    id="accountName"
                    value={paymentDraft.accountName}
                    onChange={(event) => {
                      setPaymentDraft((current) => ({
                        ...current,
                        accountName: event.target.value,
                      }));
                      setPaymentDraftErrors((current) => ({
                        ...current,
                        accountName: undefined,
                      }));
                    }}
                    placeholder="Nama sesuai rekening atau akun"
                    autoComplete="name"
                    disabled={pending}
                    aria-invalid={Boolean(paymentDraftErrors.accountName)}
                    className="h-11 rounded-xl bg-background-dark text-base md:text-sm"
                  />
                  {paymentDraftErrors.accountName?.[0] && (
                    <p className="text-xs text-red-500">
                      {paymentDraftErrors.accountName[0]}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addPaymentMethod()}
                  disabled={pending || paymentMethods.length >= 20}
                  className="h-11 w-full rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Metode Pembayaran
                </Button>
              </div>

              {paymentMethods.length > 0 && (
                <div className="space-y-2">
                  {paymentMethods.map((method, index) => (
                    <div
                      key={`${method.paymentName}-${method.accountNumber}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-foreground-dark/10 bg-muted-dark/40 p-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-dark/15 text-primary-dark">
                        <CreditCard className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {method.paymentName} · {method.accountNumber}
                        </p>
                        <p className="truncate text-xs text-muted-foreground-dark">
                          a.n. {method.accountName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPaymentMethods((current) =>
                            current.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                        disabled={pending}
                        className="rounded-full p-1 text-muted-foreground-dark transition hover:bg-foreground-dark/5 hover:text-foreground-dark"
                        aria-label={`Hapus metode pembayaran ${method.paymentName}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {fieldError("paymentMethods") && (
                <p className="text-xs text-red-500">
                  {fieldError("paymentMethods")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">Nomor WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground-dark" />
                <Input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  type="tel"
                  inputMode="tel"
                  value={whatsappNumber}
                  onChange={(event) => {
                    setWhatsappNumber(event.target.value);
                    setClientErrors((current) => ({
                      ...current,
                      whatsappNumber: undefined,
                    }));
                  }}
                  onBlur={() =>
                    setWhatsappNumber((current) =>
                      normalizeWhatsappNumber(current),
                    )
                  }
                  placeholder="Contoh: 081234567890"
                  autoComplete="tel"
                  disabled={pending}
                  aria-invalid={Boolean(fieldError("whatsappNumber"))}
                  aria-describedby={
                    fieldError("whatsappNumber")
                      ? "whatsappNumber-error"
                      : undefined
                  }
                  className="h-11 rounded-xl pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground-dark">
                Nomor akan disimpan otomatis dalam format 628xxx.
              </p>
              {fieldError("whatsappNumber") && (
                <p id="whatsappNumber-error" className="text-xs text-red-500">
                  {fieldError("whatsappNumber")}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="h-auto w-full rounded-full bg-primary-dark py-3.5 text-primary-foreground-dark hover:bg-primary-dark hover:opacity-90"
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Simpan dan Masuk Dashboard
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
