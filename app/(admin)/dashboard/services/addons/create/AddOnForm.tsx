"use client";

import { useActionState, useState } from "react";
import type { AddOn, Service } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { createAddOn, updateAddOn, type AddOnField } from "../actions";
import FormActions from "../../components/FormActions";

const billingTypeLabels: Record<string, string> = {
  flat: "Flat",
  per_unit: "Per Unit",
};

const billingTypeDescriptions: Record<string, string> = {
  flat: "Harga add-on dikenakan satu kali untuk setiap booking.",
  per_unit: "Harga add-on dikalikan dengan jumlah satuan yang dipilih klien.",
};

const unitLabels: Record<string, string> = {
  item: "Per Item",
  hourly: "Per Jam",
  person: "Per Orang",
};

const unitDescriptions: Record<string, string> = {
  item: "Harga dikalikan dengan jumlah item yang dipilih.",
  hourly: "Harga dikalikan dengan durasi per jam penggunaan add-on.",
  person: "Harga dikalikan dengan jumlah orang yang menggunakan add-on.",
};

function priceInputValue(
  price: AddOn["price"] | string | null | undefined,
) {
  if (price === undefined || price === null || price === "") return "";

  const numericPrice = Number(price);
  return Number.isFinite(numericPrice) ? String(Math.round(numericPrice)) : "";
}

export default function AddOnForm({
  services,
  addOn,
}: {
  services: Service[];
  addOn?: AddOn;
}) {
  const action = addOn ? updateAddOn.bind(null, addOn.id) : createAddOn;
  const [state, formAction, pending] = useActionState(action, undefined);
  const [billingType, setBillingType] = useState(
    state?.values?.billingType || addOn?.billingType || "flat",
  );
  const [unit, setUnit] = useState(
    state?.values?.unit || addOn?.unit || "item",
  );
  const [isActive, setIsActive] = useState(
    state?.values?.isActive ?? addOn?.isActive ?? true,
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    state?.values?.serviceIds ??
      addOn?.serviceIds ??
      addOn?.services?.map((service) => service.id) ??
      [],
  );
  useActionToast(state);

  const fieldError = (field: AddOnField) => state?.errors?.[field]?.[0];
  const allServicesSelected =
    services.length > 0 && selectedServiceIds.length === services.length;
  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  };
  const toggleAllServices = () => {
    setSelectedServiceIds(
      allServicesSelected ? [] : services.map((service) => service.id),
    );
  };

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state?.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-600"
        >
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">
          Nama Add-on <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={state?.values?.name ?? addOn?.name ?? ""}
          placeholder="Contoh: Touch-up Tambahan"
          aria-invalid={Boolean(fieldError("name"))}
          aria-describedby={fieldError("name") ? "addon-name-error" : undefined}
          className="h-11 rounded-xl"
        />
        {fieldError("name") && (
          <p id="addon-name-error" className="text-xs text-red-500">
            {fieldError("name")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={state?.values?.description ?? addOn?.description ?? ""}
          rows={4}
          placeholder="Jelaskan add-on dan apa yang akan diterima klien."
          aria-invalid={Boolean(fieldError("description"))}
          aria-describedby={
            fieldError("description") ? "addon-description-error" : undefined
          }
          className="flex min-h-24 w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-red-500"
        />
        {fieldError("description") && (
          <p id="addon-description-error" className="text-xs text-red-500">
            {fieldError("description")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="billingType">
            Tipe Penagihan <span className="text-destructive">*</span>
          </Label>
          <input
            type="hidden"
            id="billingType"
            name="billingType"
            value={billingType}
          />
          <Select
            value={billingType}
            onValueChange={(value) => {
              const nextBillingType = value ?? "flat";
              setBillingType(nextBillingType);
              setUnit(nextBillingType === "flat" ? "" : unit || "item");
            }}
          >
            <SelectTrigger
              className="h-11 w-full rounded-xl"
              aria-invalid={Boolean(fieldError("billingType"))}
              aria-describedby={`addon-billing-type-description${
                fieldError("billingType") ? " addon-billing-type-error" : ""
              }`}
            >
              <SelectValue placeholder="Pilih tipe penagihan">
                {(value: string | null) =>
                  value ? billingTypeLabels[value] : "Pilih tipe penagihan"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="per_unit">Per Unit</SelectItem>
            </SelectContent>
          </Select>
          <p
            id="addon-billing-type-description"
            className="text-xs leading-5 text-muted-foreground dark:text-muted-foreground-dark"
          >
            {billingTypeDescriptions[billingType]}
          </p>
          {fieldError("billingType") && (
            <p id="addon-billing-type-error" className="text-xs text-red-500">
              {fieldError("billingType")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">
            Satuan{" "}
            {billingType === "per_unit" && (
              <span className="text-destructive">*</span>
            )}
          </Label>
          <input
            type="hidden"
            name="unit"
            value={billingType === "flat" ? "" : unit}
          />
          {billingType === "flat" ? (
            <Input
              id="unit"
              value="Tidak berlaku untuk tipe Flat"
              disabled
              aria-label="Satuan tidak berlaku untuk tipe Flat"
              aria-describedby="addon-unit-description"
              className="h-11 rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
            />
          ) : (
            <Select
              value={unit}
              onValueChange={(value) => setUnit(value ?? "item")}
            >
              <SelectTrigger
                id="unit"
                className="h-11 w-full rounded-xl"
                aria-invalid={Boolean(fieldError("unit"))}
                aria-describedby={`addon-unit-description${
                  fieldError("unit") ? " addon-unit-error" : ""
                }`}
              >
                <SelectValue placeholder="Pilih satuan">
                  {(value: string | null) =>
                    value ? unitLabels[value] : "Pilih satuan"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="item">Per Item</SelectItem>
                <SelectItem value="hourly">Per Jam</SelectItem>
                <SelectItem value="person">Per Orang</SelectItem>
              </SelectContent>
            </Select>
          )}
          <p
            id="addon-unit-description"
            className="text-xs leading-5 text-muted-foreground dark:text-muted-foreground-dark"
          >
            {billingType === "flat"
              ? "Tipe Flat tidak menggunakan satuan karena harga hanya dikenakan satu kali."
              : unitDescriptions[unit]}
          </p>
          {fieldError("unit") && (
            <p id="addon-unit-error" className="text-xs text-red-500">
              {fieldError("unit")}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">
          Harga (Rp) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="price"
          name="price"
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          defaultValue={
            state?.values?.price ?? priceInputValue(addOn?.price)
          }
          placeholder="Contoh: 150000"
          aria-invalid={Boolean(fieldError("price"))}
          aria-describedby={
            fieldError("price") ? "addon-price-error" : undefined
          }
          className="h-11 rounded-xl"
        />
        {fieldError("price") && (
          <p id="addon-price-error" className="text-xs text-red-500">
            {fieldError("price")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="isActive">Status Add-on</Label>
        <input
          type="hidden"
          id="isActive"
          name="isActive"
          value={String(isActive)}
        />
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setIsActive((current) => !current)}
          className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
            isActive
              ? "border-primary/40 bg-primary/10 dark:border-primary-dark/40 dark:bg-primary-dark/10"
              : "border-foreground/10 bg-transparent dark:border-foreground-dark/10"
          }`}
        >
          <span>
            <span className="block text-sm font-medium">
              {isActive ? "Add-on Aktif" : "Add-on Tidak Aktif"}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground dark:text-muted-foreground-dark">
              {isActive
                ? "Add-on dapat dipilih untuk layanan terkait."
                : "Add-on disimpan, tetapi tidak dapat dipilih oleh klien."}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              isActive
                ? "bg-primary dark:bg-primary-dark"
                : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </span>
        </button>
        {fieldError("isActive") && (
          <p className="text-xs text-red-500">{fieldError("isActive")}</p>
        )}
      </div>

      <fieldset className="space-y-3">
        <legend className="sr-only">Tambahkan ke Layanan</legend>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">
            Tambahkan ke Layanan <span className="text-destructive">*</span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
          Pilih satu atau beberapa layanan yang dapat menggunakan add-on ini.
        </p>
        {services.length === 0 ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
            Tambahkan layanan terlebih dahulu sebelum membuat add-on.
          </div>
        ) : (
          <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto rounded-2xl border border-foreground/10 p-3 sm:grid-cols-2 dark:border-foreground-dark/10">
            <div className="col-span-full flex items-center justify-between gap-3 border-b border-foreground/10 pb-2 dark:border-foreground-dark/10">
              <span className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                {selectedServiceIds.length} dari {services.length} dipilih
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleAllServices}
                className="h-8 rounded-lg px-2.5 text-xs text-primary dark:text-primary-dark"
              >
                {allServicesSelected ? "Batalkan Semua" : "Pilih Semua"}
              </Button>
            </div>
            {selectedServiceIds.map((serviceId) => (
              <input
                key={serviceId}
                type="hidden"
                name="serviceIds"
                value={serviceId}
              />
            ))}
            {services.map((service) => {
              const selected = selectedServiceIds.includes(service.id);

              return (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleService(service.id)}
                  className={`flex min-w-0 cursor-pointer items-start rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                    selected
                      ? "border-primary bg-primary/10 text-foreground dark:border-primary-dark dark:bg-primary-dark/10 dark:text-foreground-dark"
                      : "border-foreground/10 bg-transparent hover:border-primary/30 hover:bg-primary/5 dark:border-foreground-dark/10 dark:hover:border-primary-dark/30 dark:hover:bg-primary-dark/5"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {service.name}
                    </span>
                    <span className="block text-xs text-muted-foreground dark:text-muted-foreground-dark">
                      Rp {service.price.toLocaleString("id-ID")}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {fieldError("serviceIds") && (
          <p className="text-xs text-red-500">{fieldError("serviceIds")}</p>
        )}
      </fieldset>

      <FormActions
        submitText={
          pending
            ? "Menyimpan..."
            : addOn
              ? "Simpan Perubahan"
              : "Simpan Add-on"
        }
        cancelHref={
          addOn
            ? `/dashboard/services/addons/${addOn.id}`
            : "/dashboard/services?tab=add-ons"
        }
      />
    </form>
  );
}
