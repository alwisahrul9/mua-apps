import { listBookings, listServices } from "@/lib/api/dashboard";
import DashboardStatsChart from "./components/DashboardStatsChart";
import DashboardBarChart from "./components/DashboardBarChart";
import MonthRangeFilter from "./components/MonthRangeFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentMuaProfile } from "@/lib/profile-cache";
import { siteConfig } from "@/lib/site-config";
import BusinessLinksCard from "./components/BusinessLinksCard";
import GoogleBusinessGuideCard from "./components/GoogleBusinessGuideCard";
import {
  CircleCheck,
  CircleDollarSign,
  CircleX,
  Clock3,
  Info,
  type LucideIcon,
} from "lucide-react";

const statusMeta: Record<
  string,
  { label: string; icon: LucideIcon; className: string }
> = {
  PENDING: {
    label: "Menunggu",
    icon: Clock3,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  DP_PAID: {
    label: "DP Dibayar",
    icon: CircleDollarSign,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  COMPLETED: {
    label: "Selesai",
    icon: CircleCheck,
    className: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  CANCELED: {
    label: "Dibatalkan",
    icon: CircleX,
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
};

function BookingStatusBadge({ status }: { status: string }) {
  const meta = statusMeta[status] ?? {
    label: status.replaceAll("_", " "),
    icon: Info,
    className: "bg-muted text-muted-foreground",
  };
  const Icon = meta.icon;

  return (
    <Badge
      className={`${meta.className} h-7 w-7 px-0 [&>svg]:size-4! sm:h-5 sm:w-auto sm:px-2 sm:[&>svg]:size-3!`}
      title={meta.label}
      aria-label={`Status: ${meta.label}`}
    >
      <Icon aria-hidden="true" />
      <span className="hidden sm:inline">{meta.label}</span>
    </Badge>
  );
}

export default async function DashboardOverview({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const [result, profile, services] = await Promise.all([
    listBookings({ per_page: 500 }),
    getCurrentMuaProfile(),
    listServices(1),
  ]);
  const start = params.start
    ? new Date(`${params.start}-01T00:00:00+07:00`)
    : null;
  const end = params.end ? new Date(`${params.end}-01T00:00:00+07:00`) : null;
  if (end) end.setMonth(end.getMonth() + 1);

  const bookings = result.data.filter((booking) => {
    const createdAt = new Date(booking.createdAt);
    return (!start || createdAt >= start) && (!end || createdAt < end);
  });
  const totalIncome = bookings
    .filter((booking) => booking.status === "COMPLETED")
    .reduce((sum, booking) => sum + booking.totalPrice, 0);
  const statuses = ["PENDING", "DP_PAID", "COMPLETED", "CANCELED"].map(
    (name) => ({
      name,
      value: bookings.filter((booking) => booking.status === name).length,
    }),
  );
  const monthly = new Map<
    string,
    { year: number; month: number; bookingCount: number; income: number }
  >();
  for (const booking of bookings) {
    const date = new Date(booking.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const item = monthly.get(key) ?? {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      bookingCount: 0,
      income: 0,
    };
    item.bookingCount += 1;
    if (booking.status === "COMPLETED") item.income += booking.totalPrice;
    monthly.set(key, item);
  }
  const latestBookings = [...bookings]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif">Selamat Datang di Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Ringkasan performa dan pesanan bisnis MUA Anda.
        </p>
      </div>
      {profile?.username && (
        <BusinessLinksCard
          baseUrl={siteConfig.url}
          username={profile.username}
          homepageIsActive={profile.homepageIsActive === true}
          hasServices={services.data.length > 0}
        />
      )}
      <GoogleBusinessGuideCard
        publicProfileUrl={
          profile?.username
            ? `${siteConfig.url}/${encodeURIComponent(profile.username)}`
            : undefined
        }
      />
      <MonthRangeFilter />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{bookings.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Pendapatan Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(totalIncome)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 rounded-2xl border bg-background p-6 lg:grid-cols-5 dark:bg-background-dark">
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            Status Booking
          </h2>
          <div className="h-[300px]">
            <DashboardStatsChart data={statuses} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            5 Booking Terbaru
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Klien</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.customCode}</TableCell>
                  <TableCell>{booking.clientName}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {monthly.size > 0 && (
        <div className="min-w-0 rounded-2xl border bg-background p-4 sm:p-6 dark:bg-background-dark">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            Statistik Per Bulan
          </h2>
          <div className="h-[400px] min-w-0">
            <DashboardBarChart data={[...monthly.values()]} />
          </div>
        </div>
      )}
    </div>
  );
}
