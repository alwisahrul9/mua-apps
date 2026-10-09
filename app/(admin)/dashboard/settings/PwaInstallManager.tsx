"use client";

import { useEffect, useState } from "react";
import { Check, Download, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import PwaInstallGuide from "@/components/PwaInstallGuide";
import PwaUninstallGuide from "@/components/PwaUninstallGuide";
import { toast } from "@/components/ui/toast";
import {
  type BeforeInstallPromptEvent,
  isPwaInstalled,
} from "@/lib/pwa-install";

export default function PwaInstallManager() {
  const [installed, setInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    let active = true;
    const refreshInstalledState = async () => {
      const detectedInstalled = await isPwaInstalled();
      if (!active) return;
      setInstalled(detectedInstalled);
    };

    void refreshInstalledState();
    queueMicrotask(() => {
      if (!active) return;
      setInstallPrompt(window.deferredPwaInstallPrompt ?? null);
    });

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      const prompt = event as BeforeInstallPromptEvent;
      window.deferredPwaInstallPrompt = prompt;
      setInstalled(false);
      setInstallPrompt(prompt);
    };
    const handlePromptAvailable = (event: Event) => {
      setInstallPrompt((event as CustomEvent<BeforeInstallPromptEvent>).detail);
    };
    const handleInstalled = () => {
      window.deferredPwaInstallPrompt = undefined;
      setInstalled(true);
      setInstallPrompt(null);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshInstalledState();
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener(
      "pwa-install-prompt-available",
      handlePromptAvailable,
    );
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("focus", refreshInstalledState);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      active = false;
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener(
        "pwa-install-prompt-available",
        handlePromptAvailable,
      );
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("focus", refreshInstalledState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    setInstalling(true);
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      window.deferredPwaInstallPrompt = undefined;
      setInstallPrompt(null);
      if (choice.outcome === "accepted") {
        setInstalled(true);
        toast.add({
          title: "Aplikasi dipasang",
          description: "JadiCantik berhasil ditambahkan ke perangkat.",
          type: "success",
          timeout: 5000,
        });
      }
    } finally {
      setInstalling(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-foreground/10 p-4 dark:border-foreground-dark/10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
            {installed ? (
              <Check className="h-5 w-5" />
            ) : (
              <Smartphone className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="font-medium">Aplikasi JadiCantik</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {installed
                ? "Aplikasi terdeteksi sudah terpasang pada perangkat ini."
                : "Pasang aplikasi untuk membuka dashboard langsung dari Home Screen atau Dock."}
            </p>
          </div>
        </div>

        {!installed && installPrompt ? (
          <Button
            type="button"
            onClick={installApp}
            disabled={installing}
            className="shrink-0 rounded-xl"
          >
            {installing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {installing ? "Memasang..." : "Instal Aplikasi"}
          </Button>
        ) : !installed ? (
          <span className="text-xs text-muted-foreground">
            Gunakan menu browser untuk menginstal
          </span>
        ) : null}
      </div>

      {!installed && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            Pilih panduan sesuai perangkat Anda
          </p>
          <PwaInstallGuide />
          <p className="text-xs leading-5 text-muted-foreground dark:text-muted-foreground-dark">
            Nama dan posisi menu dapat sedikit berbeda, tergantung versi sistem
            operasi dan browser yang digunakan.
          </p>
        </div>
      )}

      {installed && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Cara menghapus aplikasi</p>
          <p className="text-xs leading-5 text-muted-foreground">
            Browser tidak mengizinkan website menghapus aplikasi secara
            otomatis. Pilih panduan sesuai perangkat dan browser yang digunakan.
          </p>
          <PwaUninstallGuide />
        </div>
      )}
    </div>
  );
}
