"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  MonitorSmartphone,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { subscribeUser } from "../notifications/push-actions";
import { toast } from "@/components/ui/toast";
import PwaInstallGuide from "@/components/PwaInstallGuide";
import {
  type BeforeInstallPromptEvent,
  isIosOrIpadOs,
  isPwaStandalone,
} from "@/lib/pwa-install";

const DISMISSED_AT_KEY = "jadi-cantik-app-setup-dismissed-at";
const REMINDER_INTERVAL = 7 * 24 * 60 * 60 * 1000;

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (character) => character.charCodeAt(0));
}

export default function AppSetupDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const standalone = isPwaStandalone();
    const detectedIos = isIosOrIpadOs();
    const supported =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY) ?? 0);
    const reminderDue = Date.now() - dismissedAt >= REMINDER_INTERVAL;
    const notificationIncomplete =
      supported && Notification.permission !== "granted";

    queueMicrotask(() => {
      if (cancelled) return;
      setInstalled(standalone);
      setIos(detectedIos);
      setPushSupported(supported);
      setInstallPrompt(window.deferredPwaInstallPrompt ?? null);
      setOpen(
        !dismissedAt ||
          ((!standalone || notificationIncomplete) && reminderDue),
      );
      setStep(detectedIos && !standalone ? 1 : 0);
    });

    if (supported) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((registration) => registration.pushManager.getSubscription())
        .then((subscription) => setPushEnabled(Boolean(subscription)))
        .catch(() => undefined);
    }

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      const prompt = event as BeforeInstallPromptEvent;
      window.deferredPwaInstallPrompt = prompt;
      setInstallPrompt(prompt);
      window.dispatchEvent(
        new CustomEvent("pwa-install-prompt-available", { detail: prompt }),
      );
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      window.deferredPwaInstallPrompt = undefined;
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  function closeDialog() {
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    setOpen(false);
  }

  async function enablePush() {
    setMessage("");
    if (!pushSupported) {
      setMessage("Browser ini belum mendukung push notification.");
      return;
    }
    if (ios && !installed) {
      setMessage(
        "Instal aplikasi terlebih dahulu, lalu aktifkan notifikasi dari aplikasi.",
      );
      setStep(1);
      return;
    }

    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage(
          "Izin notifikasi belum diberikan. Anda dapat mengubahnya melalui pengaturan browser.",
        );
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const existing = await registration.pushManager.getSubscription();
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
      if (!vapidKey) throw new Error("VAPID public key belum dikonfigurasi");

      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        }));
      const result = await subscribeUser(subscription.toJSON());
      if (!result.success) throw new Error(result.error);

      setPushEnabled(true);
      setMessage("Notifikasi berhasil diaktifkan.");
      toast.add({
        title: "Berhasil",
        description: "Notifikasi berhasil diaktifkan.",
        type: "success",
        timeout: 5000,
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Notifikasi belum berhasil diaktifkan.",
      );
      toast.add({
        title: "Gagal mengaktifkan notifikasi",
        description:
          error instanceof Error ? error.message : "Silakan coba lagi.",
        type: "error",
        timeout: 6000,
      });
    } finally {
      setPushLoading(false);
    }
  }

  async function installApp() {
    setMessage("");
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setInstallPrompt(null);
    window.deferredPwaInstallPrompt = undefined;
  }

  const notificationSlide = (
    <>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary dark:bg-primary-dark/15 dark:text-primary-dark">
        {pushEnabled ? (
          <Check className="h-8 w-8" />
        ) : (
          <Bell className="h-8 w-8" />
        )}
      </div>
      <div className="space-y-2">
        <DialogTitle className="font-serif text-2xl leading-tight">
          Dapatkan notifikasi pesanan
        </DialogTitle>
        <DialogDescription className="leading-6">
          Aktifkan notifikasi agar booking dan aktivitas penting dapat segera
          diketahui, termasuk saat dashboard sedang tidak dibuka.
        </DialogDescription>
      </div>
      <div className="rounded-2xl border border-foreground/10 bg-muted/50 p-4 dark:border-foreground-dark/10 dark:bg-muted-dark/50">
        <p className="text-sm leading-6 text-muted-foreground dark:text-muted-foreground-dark">
          Izin hanya diminta setelah Anda menekan tombol. Pada iPhone dan iPad,
          push notification tersedia setelah aplikasi ditambahkan ke Layar
          Utama.
        </p>
      </div>
      <Button
        type="button"
        onClick={enablePush}
        disabled={pushLoading || pushEnabled}
        className="h-11 w-full rounded-xl"
      >
        {pushLoading ? (
          <Loader2 className="animate-spin" />
        ) : pushEnabled ? (
          <Check />
        ) : (
          <Bell />
        )}
        {pushEnabled ? "Notifikasi Sudah Aktif" : "Aktifkan Notifikasi"}
      </Button>
    </>
  );

  const installSlide = (
    <>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary dark:bg-primary-dark/15 dark:text-primary-dark">
        {installed ? (
          <Check className="h-8 w-8" />
        ) : (
          <MonitorSmartphone className="h-8 w-8" />
        )}
      </div>
      <div className="space-y-2">
        <DialogTitle className="font-serif text-2xl leading-tight">
          Akses dashboard lebih cepat
        </DialogTitle>
        <DialogDescription className="leading-6">
          Pasang JadiCantik sebagai aplikasi agar dashboard dapat dibuka
          langsung dari Home Screen, Dock, atau daftar aplikasi.
        </DialogDescription>
      </div>
      {installed ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
          <Check className="h-5 w-5 shrink-0" />
          Aplikasi sudah dibuka dalam mode standalone.
        </div>
      ) : (
        <PwaInstallGuide compact />
      )}
      {!installed && installPrompt && (
        <Button
          type="button"
          onClick={installApp}
          className="h-11 w-full rounded-xl"
        >
          <Download /> Instal Aplikasi
        </Button>
      )}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && closeDialog()}>
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg gap-5 overflow-y-auto rounded-3xl p-5 sm:p-7">
        <DialogHeader className="sr-only">
          <DialogTitle>Siapkan aplikasi JadiCantik</DialogTitle>
          <DialogDescription>
            Panduan notifikasi dan pemasangan aplikasi.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 pr-8">
          <div
            className="flex gap-1.5"
            aria-label={`Langkah ${step + 1} dari 2`}
          >
            {[0, 1].map((item) => (
              <span
                key={item}
                className={`h-1.5 rounded-full transition-all ${
                  item === step
                    ? "w-8 bg-primary dark:bg-primary-dark"
                    : "w-3 bg-foreground/15 dark:bg-foreground-dark/15"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
            {step + 1} / 2
          </span>
        </div>

        <div className="grid min-h-[21rem] content-start gap-5">
          {step === 0 ? notificationSlide : installSlide}
          {message && (
            <p
              role="status"
              className="text-sm text-muted-foreground dark:text-muted-foreground-dark"
            >
              {message}
            </p>
          )}
        </div>

        <div className="flex gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-3.5 text-xs leading-5 dark:border-primary-dark/15 dark:bg-primary-dark/5">
          <Settings className="mt-0.5 h-4 w-4 shrink-0 text-primary dark:text-primary-dark" />
          <p>
            Belum ingin mengaturnya sekarang? Anda dapat mengaturnya kapan saja.
            Di smartphone, ketuk ikon <strong>Profil</strong> di pojok kanan
            bawah, lalu pilih <strong>Pengaturan</strong>. Di desktop, klik ikon
            profil di pojok kanan atas, lalu pilih <strong>Pengaturan</strong>.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-foreground/10 pt-4 dark:border-foreground-dark/10">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(0)}
            disabled={step === 0}
            className="rounded-xl"
          >
            <ChevronLeft /> Kembali
          </Button>
          {step === 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="rounded-xl"
            >
              Selanjutnya <ChevronRight />
            </Button>
          ) : (
            <Button type="button" onClick={closeDialog} className="rounded-xl">
              Selesai
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
