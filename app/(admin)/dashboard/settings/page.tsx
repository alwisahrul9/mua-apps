import { Bell, MoonStar, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PushNotificationManager } from "../components/PushNotificationManager";
import PwaInstallManager from "./PwaInstallManager";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Pengaturan</h1>
        <p className="mt-1 text-muted-foreground">
          Atur tampilan dan izin aplikasi pada perangkat ini.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MoonStar className="h-5 w-5" /> Tampilan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-foreground/10 p-4 dark:border-foreground-dark/10">
            <div>
              <p className="font-medium">Mode Gelap</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Gunakan tema gelap untuk dashboard pada perangkat ini.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" /> Instalasi Aplikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PwaInstallManager />
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifikasi Real-Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-foreground/10 p-4 dark:border-foreground-dark/10 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium">Izin notifikasi perangkat</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Terima pemberitahuan booking dan aktivitas terbaru meskipun
                dashboard sedang tidak dibuka.
              </p>
            </div>
            <div className="shrink-0">
              <PushNotificationManager showLabel />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
