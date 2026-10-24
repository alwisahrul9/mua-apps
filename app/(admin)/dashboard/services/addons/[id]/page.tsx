import Link from "next/link";
import { ArrowLeft, Edit, Layers3 } from "lucide-react";
import { notFound } from "next/navigation";
import { getAddOn } from "@/lib/api/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { deleteAddOn } from "../actions";
import DeleteAddOnDialog from "../components/DeleteAddOnDialog";

const billingLabels = {
  flat: "Flat",
  per_unit: "Per Unit",
};

const unitLabels = {
  item: "Per Item",
  hourly: "Per Jam",
  person: "Per Orang",
};

export default async function AddOnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const addOn = await getAddOn(id).catch(() => null);

  if (!addOn) notFound();
  const deleteAddOnWithId = deleteAddOn.bind(null, addOn.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <Link
          href="/dashboard/services?tab=add-ons"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-muted-dark"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Kembali ke daftar add-on</span>
        </Link>
        <div>
          <h1 className="font-serif text-2xl">Detail Add-on</h1>
          <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground-dark">
            Informasi lengkap add-on yang dapat digunakan pada layanan Anda.
          </p>
        </div>
      </div>

      <Card className="relative overflow-hidden rounded-2xl border-foreground/10 shadow-sm dark:border-foreground-dark/10">
        <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
          <DeleteAddOnDialog name={addOn.name} action={deleteAddOnWithId} />
        </div>
        <CardContent className="space-y-7 p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-12 sm:pr-14">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                {addOn.name}
              </h2>
              <p className="mt-2 mb-5 text-2xl font-semibold text-primary dark:text-primary-dark">
                Rp {Number(addOn.price).toLocaleString("id-ID")}
              </p>
              <Badge
                variant="outline"
                className={
                  addOn.isActive
                    ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300"
                    : "border-foreground/10 bg-muted text-muted-foreground dark:bg-muted-dark"
                }
              >
                {addOn.isActive ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
          </div>

          <section>
            <h3 className="text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark">
              Deskripsi
            </h3>
            <p className="mt-2 whitespace-pre-wrap rounded-xl border border-foreground/5 bg-muted/20 p-4 leading-7 dark:border-foreground-dark/5 dark:bg-muted-dark/20">
              {addOn.description || "Tidak ada deskripsi untuk add-on ini."}
            </p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-foreground/10 p-4 dark:border-foreground-dark/10">
              <h3 className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                Tipe Penagihan
              </h3>
              <p className="mt-1 font-medium">
                {billingLabels[addOn.billingType]}
              </p>
            </section>
            <section className="rounded-xl border border-foreground/10 p-4 dark:border-foreground-dark/10">
              <h3 className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
                Satuan
              </h3>
              <p className="mt-1 font-medium">
                {addOn.unit
                  ? unitLabels[addOn.unit]
                  : "Tidak menggunakan satuan"}
              </p>
            </section>
          </div>

          <section>
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Layanan Terkait</h3>
            </div>
            {addOn.services?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {addOn.services.map((service) => (
                  <Badge
                    key={service.id}
                    variant="secondary"
                    className="rounded-full"
                  >
                    {service.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground-dark">
                Belum ada layanan yang terhubung.
              </p>
            )}
          </section>
        </CardContent>

        <CardFooter className="justify-end border-t border-foreground/10 bg-muted/20 p-5 dark:border-foreground-dark/10 dark:bg-muted-dark/20 sm:p-6">
          <Button
            render={
              <Link href={`/dashboard/services/addons/${addOn.id}/edit`} />
            }
            nativeButton={false}
            className="h-11 w-full rounded-xl px-6 sm:w-auto"
          >
            <Edit className="h-4 w-4" />
            Edit Add-on
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
