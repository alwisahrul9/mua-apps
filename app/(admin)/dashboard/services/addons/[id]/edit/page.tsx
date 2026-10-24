import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getAddOn, listAllServices } from "@/lib/api/dashboard";
import AddOnForm from "../../create/AddOnForm";

export default async function EditAddOnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [addOn, services] = await Promise.all([
    getAddOn(id).catch(() => null),
    listAllServices(),
  ]);

  if (!addOn) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <Link
          href={`/dashboard/services/addons/${addOn.id}`}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-muted-dark"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Kembali ke detail add-on</span>
        </Link>
        <div>
          <h1 className="font-serif text-2xl">Edit Add-on</h1>
          <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground-dark">
            Perbarui informasi, harga, status, dan layanan terkait.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm dark:border-foreground-dark/10 dark:bg-background-dark sm:p-8">
        <AddOnForm services={services} addOn={addOn} />
      </div>
    </div>
  );
}
