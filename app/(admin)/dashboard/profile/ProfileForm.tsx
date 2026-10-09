"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { MuaProfile } from "@/lib/api/types";
import type { IndonesiaRegion } from "@/lib/indonesia-regions";
import { normalizeWhatsappNumber } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useActionToast } from "@/hooks/use-action-toast";
import ResumableImageUpload from "@/components/ResumableImageUpload";
import { deleteProfileImage, updateProfile } from "./actions";
import { profileSchema, type ProfileValues } from "./schema";
import SupportedBrandsGallery from "./SupportedBrandsGallery";

const textareaClass =
  "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-base outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 md:text-sm";

export default function ProfileForm({
  profile,
  provinces,
}: {
  profile: MuaProfile;
  provinces: IndonesiaRegion[];
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  useActionToast(state);
  const [values, setValues] = useState({
    username: profile.username ?? "",
    slug: profile.slug ?? "",
    brandName: profile.brandName ?? "",
    homepageIsActive: profile.homepageIsActive,
    tagline: profile.tagline ?? "",
    heroTitle: profile.heroTitle ?? "",
    heroDescription: profile.heroDescription ?? "",
    profileImageUrl: profile.profileImageUrl ?? "",
    coverImageUrl: profile.coverImageUrl ?? "",
    instagramUsername: profile.instagramUsername ?? "",
    whatsappNumber: profile.whatsappNumber ?? "",
    address: profile.address ?? "",
  });
  const [supportedBrands, setSupportedBrands] = useState(
    profile.supportedBrands ?? [],
  );
  const [serviceAreas, setServiceAreas] = useState(profile.serviceArea ?? []);
  const [areaDraft, setAreaDraft] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [regencies, setRegencies] = useState<IndonesiaRegion[]>([]);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [regionError, setRegionError] = useState("");
  const [manualArea, setManualArea] = useState(provinces.length === 0);
  const [paymentMethods, setPaymentMethods] = useState(
    profile.paymentMethod ?? [],
  );
  const [removingImage, setRemovingImage] = useState<
    "profile" | "cover" | null
  >(null);
  const busy = pending || removingImage !== null;
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [coverImageUploading, setCoverImageUploading] = useState(false);
  const [brandImageUploading, setBrandImageUploading] = useState(false);
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<keyof ProfileValues, string[]>>
  >({});

  const fieldError = (field: keyof ProfileValues) =>
    clientErrors[field]?.[0] ?? state?.errors?.[field]?.[0];
  const clearError = (field: keyof ProfileValues) =>
    setClientErrors((current) => ({ ...current, [field]: undefined }));
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
          "Daftar kota/kabupaten gagal dimuat. Silakan isi secara manual.",
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
      serviceAreas.some((item) => item.toLowerCase() === area.toLowerCase())
    )
      return;
    setServiceAreas((current) => [...current, area]);
    setAreaDraft("");
    clearError("serviceArea");
  }

  async function removeImage(purpose: "profile" | "cover"): Promise<boolean> {
    if (
      busy ||
      profileImageUploading ||
      coverImageUploading ||
      brandImageUploading
    )
      return false;
    setRemovingImage(purpose);
    try {
      const result = await deleteProfileImage(purpose);
      if (result.error) {
        toast.add({
          title: "Gagal menghapus gambar",
          description: result.error,
          type: "error",
          timeout: 6000,
        });
        return false;
      }
      const field = purpose === "profile" ? "profileImageUrl" : "coverImageUrl";
      setValues((current) => ({ ...current, [field]: "" }));
      clearError(field);
      toast.add({
        title: result.success ?? "Gambar berhasil dihapus.",
        type: "success",
        timeout: 5000,
      });
      return true;
    } catch {
      toast.add({
        title: "Gagal menghapus gambar",
        description: "Silakan coba lagi.",
        type: "error",
        timeout: 6000,
      });
      return false;
    } finally {
      setRemovingImage(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      busy ||
      profileImageUploading ||
      coverImageUploading ||
      brandImageUploading
    )
      return;
    const draft = areaDraft.trim();
    const nextServiceAreas =
      draft &&
      !serviceAreas.some((item) => item.toLowerCase() === draft.toLowerCase())
        ? [...serviceAreas, draft]
        : serviceAreas;
    const candidate = {
      ...values,
      supportedBrands,
      serviceArea: nextServiceAreas,
      paymentMethods,
    };
    const parsed = profileSchema.safeParse(candidate);
    if (!parsed.success) {
      setClientErrors(parsed.error.flatten().fieldErrors);
      toast.add({
        title: "Data belum valid",
        description: "Periksa kembali field yang ditandai.",
        type: "error",
        timeout: 5000,
      });
      return;
    }

    setClientErrors({});
    setServiceAreas(nextServiceAreas);
    setAreaDraft("");
    setValues((current) => ({
      ...current,
      whatsappNumber: parsed.data.whatsappNumber,
    }));
    const formData = new FormData(event.currentTarget);
    formData.set("homepageIsActive", String(parsed.data.homepageIsActive));
    formData.set(
      "supportedBrands",
      JSON.stringify(parsed.data.supportedBrands),
    );
    formData.set("serviceArea", JSON.stringify(parsed.data.serviceArea));
    formData.set("paymentMethods", JSON.stringify(parsed.data.paymentMethods));
    formData.set("whatsappNumber", parsed.data.whatsappNumber);
    startTransition(() => action(formData));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="p-3 space-y-6">
      {state?.error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
          {state.error}
        </p>
      )}

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Identitas dan halaman publik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field
            label="Username"
            error={fieldError("username")}
            hint="Dipakai pada alamat halaman publik."
          >
            <Input
              name="username"
              placeholder="Contoh: aldenamakeup"
              value={values.username}
              onChange={(event) => {
                setValues({
                  ...values,
                  username: event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, ""),
                });
                clearError("username");
              }}
              disabled={busy}
              className="h-11 rounded-xl"
            />
          </Field>
          <Field
            label="Slug internal"
            error={fieldError("slug")}
            hint="Huruf kecil, angka, dan tanda hubung."
          >
            <Input
              name="slug"
              placeholder="Contoh: aldena-makeup-pemalang"
              value={values.slug}
              onChange={(event) => {
                setValues({
                  ...values,
                  slug: event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, ""),
                });
                clearError("slug");
              }}
              disabled={busy}
              className="h-11 rounded-xl"
            />
          </Field>
          <Field label="Nama brand" error={fieldError("brandName")}>
            <Input
              name="brandName"
              placeholder="Contoh: Aldena Makeup"
              value={values.brandName}
              onChange={(event) => {
                setValues({ ...values, brandName: event.target.value });
                clearError("brandName");
              }}
              disabled={busy}
              className="h-11 rounded-xl"
            />
          </Field>
          <Field label="Tagline" error={fieldError("tagline")}>
            <Input
              name="tagline"
              placeholder="Contoh: Tampil Cantik dan Percaya Diri"
              value={values.tagline}
              onChange={(event) => {
                setValues({ ...values, tagline: event.target.value });
                clearError("tagline");
              }}
              disabled={busy}
              className="h-11 rounded-xl"
            />
          </Field>
          <div className="md:col-span-2 flex items-start justify-between gap-4 rounded-xl border border-foreground/10 p-4 dark:border-foreground-dark/10">
            <div className="min-w-0">
              <Label htmlFor="homepageIsActive">Homepage Aktif</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Izinkan halaman publik dan portofolio digunakan.
              </p>
              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                *Klik Simpan Semua Perubahan untuk melihat perubahan.
              </p>
              {values.homepageIsActive && values.username && (
                <div className="mt-3 flex flex-col items-start gap-1.5">
                  <Link
                    href={`/${values.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-primary underline-offset-4 hover:underline dark:text-primary-dark"
                  >
                    Lihat homepage /{values.username}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                  {!profile.homepageIsActive && (
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                      Simpan perubahan terlebih dahulu agar homepage dapat
                      dibuka.
                    </p>
                  )}
                </div>
              )}
            </div>
            <input
              id="homepageIsActive"
              name="homepageIsActive"
              type="checkbox"
              checked={values.homepageIsActive}
              onChange={(event) => {
                setValues({
                  ...values,
                  homepageIsActive: event.target.checked,
                });
                clearError("homepageIsActive");
              }}
              disabled={busy}
              className="h-5 w-5 accent-primary"
            />
          </div>
          {fieldError("homepageIsActive") && (
            <ErrorText>{fieldError("homepageIsActive")}</ErrorText>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Konten homepage</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label="Judul hero" error={fieldError("heroTitle")}>
            <Input
              name="heroTitle"
              placeholder="Contoh: Jasa Makeup Profesional di Pemalang"
              value={values.heroTitle}
              onChange={(event) => {
                setValues({ ...values, heroTitle: event.target.value });
                clearError("heroTitle");
              }}
              disabled={busy}
              className="h-11 rounded-xl"
            />
          </Field>
          <SupportedBrandsGallery
            value={supportedBrands}
            username={values.username}
            onChange={(urls) => {
              setSupportedBrands(urls);
              clearError("supportedBrands");
            }}
            disabled={busy || profileImageUploading || coverImageUploading}
            error={fieldError("supportedBrands")}
            onUploadingChange={setBrandImageUploading}
          />
          <div className="grid items-start gap-5 md:grid-cols-2">
            <ResumableImageUpload
              id="profileImage"
              name="profileImageUrl"
              label="Foto profil"
              purpose="profile"
              shape="circle"
              value={values.profileImageUrl}
              onChange={(url) => {
                setValues((current) => ({ ...current, profileImageUrl: url }));
                clearError("profileImageUrl");
              }}
              disabled={busy || coverImageUploading || brandImageUploading}
              onRemove={() => removeImage("profile")}
              removeDisabled={
                profileImageUploading ||
                coverImageUploading ||
                brandImageUploading
              }
              onUploadingChange={setProfileImageUploading}
              error={fieldError("profileImageUrl")}
            />
            <ResumableImageUpload
              id="coverImage"
              name="coverImageUrl"
              label="Gambar cover"
              purpose="cover"
              value={values.coverImageUrl}
              onChange={(url) => {
                setValues((current) => ({ ...current, coverImageUrl: url }));
                clearError("coverImageUrl");
              }}
              disabled={busy || profileImageUploading || brandImageUploading}
              onRemove={() => removeImage("cover")}
              removeDisabled={
                profileImageUploading ||
                coverImageUploading ||
                brandImageUploading
              }
              onUploadingChange={setCoverImageUploading}
              error={fieldError("coverImageUrl")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroDescription">Deskripsi hero</Label>
            <textarea
              id="heroDescription"
              name="heroDescription"
              value={values.heroDescription}
              onChange={(event) => {
                setValues({ ...values, heroDescription: event.target.value });
                clearError("heroDescription");
              }}
              rows={5}
              placeholder="Jelaskan layanan utama, keunggulan, dan alasan klien memilih jasa Anda."
              disabled={busy}
              className={textareaClass}
            />
            {fieldError("heroDescription") && (
              <ErrorText>{fieldError("heroDescription")}</ErrorText>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Kontak dan wilayah layanan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field
            label="Username Instagram"
            error={fieldError("instagramUsername")}
          >
            <Input
              name="instagramUsername"
              value={values.instagramUsername}
              onChange={(event) => {
                setValues({ ...values, instagramUsername: event.target.value });
                clearError("instagramUsername");
              }}
              placeholder="Contoh: aldenamakeup (tanpa @ dan URL)"
              disabled={busy}
              className="h-11 rounded-xl"
            />
          </Field>
          <Field label="Nomor WhatsApp" error={fieldError("whatsappNumber")}>
            <Input
              name="whatsappNumber"
              inputMode="tel"
              placeholder="Contoh: 6281234567890"
              value={values.whatsappNumber}
              onChange={(event) => {
                setValues({ ...values, whatsappNumber: event.target.value });
                clearError("whatsappNumber");
              }}
              onBlur={() =>
                setValues((current) => ({
                  ...current,
                  whatsappNumber: normalizeWhatsappNumber(
                    current.whatsappNumber,
                  ),
                }))
              }
              disabled={busy}
              className="h-11 rounded-xl"
            />
          </Field>
          <div className="space-y-4 rounded-2xl border border-foreground/10 bg-muted/30 p-4 dark:border-foreground-dark/10 dark:bg-muted-dark/30 md:col-span-2 md:p-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground dark:text-foreground-dark">
                Wilayah layanan
              </h3>
              <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground-dark">
                Pilih provinsi terlebih dahulu, kemudian pilih kota atau
                kabupaten.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileProvince">Provinsi</Label>
              <div className="relative">
                <select
                  id="profileProvince"
                  value={provinceCode}
                  onChange={(event) => {
                    const nextCode = event.target.value;
                    setProvinceCode(nextCode);
                    setAreaDraft("");
                    setRegencies([]);
                    setRegionError("");
                    setManualArea(provinces.length === 0);
                    setLoadingRegencies(Boolean(nextCode));
                  }}
                  disabled={pending || provinces.length === 0}
                  className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-3 pr-10 text-base text-foreground outline-none transition [color-scheme:light] focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-background-dark dark:text-foreground-dark dark:[color-scheme:dark] md:text-sm"
                >
                  <option value="">
                    {provinces.length
                      ? "Pilih provinsi"
                      : "Daftar provinsi tidak tersedia"}
                  </option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileServiceArea">Kota/Kabupaten</Label>
              <div className="relative">
                {manualArea ? (
                  <>
                    <MapPin className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="profileServiceArea"
                      value={areaDraft}
                      onChange={(event) => {
                        setAreaDraft(event.target.value);
                        clearError("serviceArea");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addServiceArea();
                        }
                      }}
                      placeholder="Ketik nama kota/kabupaten"
                      disabled={busy}
                      className="h-11 rounded-xl pl-10 text-base md:text-sm"
                    />
                  </>
                ) : (
                  <>
                    <select
                      id="profileServiceArea"
                      value={areaDraft}
                      onChange={(event) => {
                        if (event.target.value === "__manual__") {
                          setAreaDraft("");
                          setManualArea(true);
                        } else setAreaDraft(event.target.value);
                        clearError("serviceArea");
                      }}
                      disabled={
                        pending ||
                        loadingRegencies ||
                        !provinceCode ||
                        regencies.length === 0
                      }
                      className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-3 pr-10 text-base text-foreground outline-none transition [color-scheme:light] focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-background-dark dark:text-foreground-dark dark:[color-scheme:dark] md:text-sm"
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
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={addServiceArea}
                disabled={pending || !areaDraft.trim()}
                className="h-10 rounded-xl"
              >
                <Plus /> Tambah Wilayah
              </Button>
              {manualArea && provinces.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setManualArea(false);
                    setAreaDraft("");
                  }}
                  disabled={pending || !provinceCode || regencies.length === 0}
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
                >
                  Kembali pilih dari daftar
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Pilih dari daftar atau isi kota/kabupaten secara manual. Hanya
              nama wilayah yang disimpan.
            </p>
            {regionError && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {regionError}
              </p>
            )}

            {serviceAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-muted px-3 py-1.5 text-sm dark:border-foreground-dark/10 dark:bg-muted-dark"
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() =>
                        setServiceAreas((current) =>
                          current.filter((item) => item !== area),
                        )
                      }
                      disabled={busy}
                      className="rounded-full text-muted-foreground hover:text-foreground"
                      aria-label={`Hapus ${area}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {fieldError("serviceArea") && (
              <ErrorText>{fieldError("serviceArea")}</ErrorText>
            )}
          </div>
          <Field label="Alamat" error={fieldError("address")}>
            <textarea
              name="address"
              value={values.address}
              onChange={(event) => {
                setValues({ ...values, address: event.target.value });
                clearError("address");
              }}
              rows={5}
              placeholder="Contoh: Jl. Merpati No. 10, Pemalang, Jawa Tengah"
              disabled={busy}
              className={textareaClass}
            />
          </Field>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Metode pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-2xl border border-foreground/10 p-4 dark:border-foreground-dark/10 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
            >
              <Field label="Nama pembayaran">
                <Input
                  value={method.paymentName}
                  onChange={(event) => {
                    setPaymentMethods((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, paymentName: event.target.value }
                          : item,
                      ),
                    );
                    clearError("paymentMethods");
                  }}
                  placeholder="Contoh: BCA, Mandiri, atau GoPay"
                  disabled={busy}
                  className="h-11 rounded-xl"
                />
              </Field>
              <Field label="Nomor akun">
                <Input
                  value={method.accountNumber}
                  inputMode="numeric"
                  placeholder="Contoh: 1234567890"
                  onChange={(event) => {
                    setPaymentMethods((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              accountNumber: event.target.value.replace(
                                /\D/g,
                                "",
                              ),
                            }
                          : item,
                      ),
                    );
                    clearError("paymentMethods");
                  }}
                  disabled={busy}
                  className="h-11 rounded-xl"
                />
              </Field>
              <Field label="Nama pemilik">
                <Input
                  value={method.accountName}
                  placeholder="Contoh: Aldena Putri"
                  onChange={(event) => {
                    setPaymentMethods((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, accountName: event.target.value }
                          : item,
                      ),
                    );
                    clearError("paymentMethods");
                  }}
                  disabled={busy}
                  className="h-11 rounded-xl"
                />
              </Field>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() =>
                  setPaymentMethods((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                disabled={busy}
                className="h-11 w-11 rounded-xl"
              >
                <Trash2 />
                <span className="sr-only">Hapus metode pembayaran</span>
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setPaymentMethods((current) => [
                ...current,
                { paymentName: "", accountNumber: "", accountName: "" },
              ])
            }
            disabled={pending || paymentMethods.length >= 20}
            className="h-11 rounded-xl"
          >
            <Plus /> Tambah Metode
          </Button>
          {fieldError("paymentMethods") && (
            <ErrorText>{fieldError("paymentMethods")}</ErrorText>
          )}
        </CardContent>
      </Card>

      <div className="sticky bottom-20 z-20 flex justify-end rounded-2xl border border-foreground/10 bg-background/90 p-3 shadow-lg backdrop-blur dark:border-foreground-dark/10 dark:bg-background-dark/90 md:bottom-4">
        <Button
          type="submit"
          disabled={
            busy ||
            profileImageUploading ||
            coverImageUploading ||
            brandImageUploading
          }
          className="h-11 rounded-xl px-6"
        >
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          {pending ? "Menyimpan..." : "Simpan Semua Perubahan"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }: { children?: React.ReactNode }) {
  return <p className="text-xs text-red-500">{children}</p>;
}
