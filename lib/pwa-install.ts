export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Window {
    deferredPwaInstallPrompt?: BeforeInstallPromptEvent;
  }

  interface Navigator {
    getInstalledRelatedApps?: () => Promise<InstalledRelatedApp[]>;
  }
}

interface InstalledRelatedApp {
  id?: string;
  platform: string;
  url?: string;
}

export function isPwaStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export async function isPwaInstalled() {
  if (isPwaStandalone()) return true;

  if (typeof navigator.getInstalledRelatedApps !== "function") return false;

  try {
    const relatedApps = await navigator.getInstalledRelatedApps();
    return relatedApps.some((app) => app.platform === "webapp");
  } catch {
    return false;
  }
}

export function isIosOrIpadOs() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isSafariBrowser() {
  return /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|Edg|OPR/.test(navigator.userAgent);
}
