"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, LogOut, Settings, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { unsubscribeUser } from "./notifications/push-actions";
import {
  getNotifications,
  markNotificationAsRead,
} from "./notifications/actions";
import { useAppStore } from "@/store/app-store";
import type { Notification } from "@/lib/api/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import { RetryingHtmlImage } from "@/components/RetryingImage";

export default function TopNav({
  name,
  profileImageUrl,
}: {
  name: string | undefined;
  profileImageUrl?: string | null;
}) {
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [openingNotificationId, setOpeningNotificationId] = useState<string | null>(null);
  const [avatarOverride, setAvatarOverride] = useState<{
    base: string | null | undefined;
    value: string;
  } | null>(null);
  const avatarUrl =
    avatarOverride && avatarOverride.base === profileImageUrl
      ? avatarOverride.value
      : (profileImageUrl ?? "");
  const unreadNotifications = useAppStore((state) => state.unreadNotifications);
  const setUnreadNotifications = useAppStore(
    (state) => state.setUnreadNotifications,
  );

  useEffect(() => {
    const updateAvatar = (event: Event) => {
      const url = (event as CustomEvent<string>).detail ?? "";
      setAvatarOverride({ base: profileImageUrl, value: url });
    };
    window.addEventListener("profile-image-updated", updateAvatar);
    return () =>
      window.removeEventListener("profile-image-updated", updateAvatar);
  }, [profileImageUrl]);

  useEffect(() => {
    const toggleMobileProfileMenu = () => {
      setIsNotificationsOpen(false);
      setIsProfileOpen((current) => !current);
    };
    window.addEventListener(
      "toggle-mobile-profile-menu",
      toggleMobileProfileMenu,
    );
    return () =>
      window.removeEventListener(
        "toggle-mobile-profile-menu",
        toggleMobileProfileMenu,
      );
  }, []);

  useEffect(() => {
    let active = true;
    const loadNotifications = async (showLoading = false) => {
      if (showLoading) setNotificationsLoading(true);
      const result = await getNotifications();
      if (active && !result.error) {
        setNotifications(result.data);
        setUnreadNotifications(
          result.data.filter((item) => !item.isRead).length,
        );
      }
      if (active && showLoading) setNotificationsLoading(false);
    };

    void loadNotifications();
    const interval = window.setInterval(() => void loadNotifications(), 30_000);
    const handleNotificationsRead = (event: Event) => {
      const detail = (event as CustomEvent<{ all?: boolean }>).detail;
      setUnreadNotifications(
        detail?.all
          ? 0
          : Math.max(0, useAppStore.getState().unreadNotifications - 1),
      );
      window.setTimeout(() => void loadNotifications(), 500);
    };
    const receiveBooking = () => void loadNotifications();
    window.addEventListener("booking-notification", receiveBooking);
    window.addEventListener("notificationsRead", handleNotificationsRead);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("booking-notification", receiveBooking);
      window.removeEventListener("notificationsRead", handleNotificationsRead);
    };
  }, [setUnreadNotifications]);

  const avatar =
    avatarUrl ? (
      <RetryingHtmlImage
        src={avatarUrl}
        alt="Foto profil"
        className="h-full w-full object-cover"
        fallback={<User className="h-1/2 w-1/2" />}
      />
    ) : (
      <User className="h-1/2 w-1/2" />
    );

  const handleNotificationClick = async (notification: Notification) => {
    if (openingNotificationId) return;
    setOpeningNotificationId(notification.id);

    if (!notification.isRead) {
      const result = await markNotificationAsRead(notification.id);
      if (!result.success) {
        toast.add({
          title: "Gagal membuka notifikasi",
          description: result.error,
          type: "error",
          timeout: 6000,
        });
        setOpeningNotificationId(null);
        return;
      }
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item,
        ),
      );
      window.dispatchEvent(
        new CustomEvent("notificationsRead", { detail: { all: false } }),
      );
    }

    setIsNotificationsOpen(false);
    router.push(
      notification.bookingId
        ? `/dashboard/bookings/${notification.bookingId}/edit`
        : "/dashboard/notifications",
    );
    setOpeningNotificationId(null);
  };

  return (
    <>
      <header className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border-b border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 p-4 flex items-center justify-between sticky top-0 z-30">
        <h2 className="font-serif text-xl md:hidden">MUA Admin</h2>
        <div className="hidden md:block">
          {/* Empty space for desktop on the left if needed */}
        </div>
        <div className="flex items-center gap-4 relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(false);
              setIsNotificationsOpen((current) => !current);
              setNotificationsLoading(true);
              void getNotifications().then((result) => {
                if (!result.error) {
                  setNotifications(result.data);
                  setUnreadNotifications(
                    result.data.filter((item) => !item.isRead).length,
                  );
                }
                setNotificationsLoading(false);
              });
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-muted-dark dark:hover:text-foreground-dark"
            aria-label="Buka notifikasi"
            aria-expanded={isNotificationsOpen}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute right-0.5 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground-dark">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setIsNotificationsOpen(false);
              setIsProfileOpen(!isProfileOpen);
            }}
            className="hidden items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-primary/10 text-primary dark:text-primary-dark hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
            title="Profil"
          >
            {avatar}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  className="fixed inset-x-4 top-[4.5rem] z-[60] max-h-[calc(100dvh-6rem)] overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-xl dark:border-foreground-dark/10 dark:bg-background-dark md:absolute md:inset-x-auto md:right-12 md:top-14 md:w-[min(22rem,calc(100vw-2rem))]"
                >
                  <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3 dark:border-foreground-dark/10">
                    <div>
                      <p className="font-semibold">Notifikasi</p>
                      <p className="text-xs text-muted-foreground">
                        Aktivitas terbaru bisnis Anda
                      </p>
                    </div>
                    {unreadNotifications > 0 && (
                      <span className="text-xs font-medium text-primary dark:text-primary-dark">
                        {unreadNotifications} baru
                      </span>
                    )}
                  </div>
                  <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto overscroll-contain md:max-h-80">
                    {notificationsLoading ? (
                      <div
                        className="space-y-3 p-4"
                        aria-label="Memuat notifikasi"
                      >
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="h-14 animate-pulse rounded-xl bg-muted dark:bg-muted-dark"
                          />
                        ))}
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <button
                          type="button"
                          key={notification.id}
                          onClick={() => void handleNotificationClick(notification)}
                          disabled={openingNotificationId === notification.id}
                          className={`block w-full border-b border-foreground/5 px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/60 disabled:cursor-wait dark:hover:bg-muted-dark/60 ${openingNotificationId === notification.id ? "opacity-60" : ""} ${!notification.isRead ? "bg-primary/5 dark:bg-primary-dark/5" : ""}`}
                        >
                          <div className="flex items-start gap-2">
                            {!notification.isRead && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary dark:bg-primary-dark" />
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {notification.title}
                              </p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Belum ada notifikasi.
                      </div>
                    )}
                  </div>
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="block border-t border-foreground/10 px-4 py-3 text-center text-sm font-medium text-primary hover:bg-muted/50 dark:border-foreground-dark/10 dark:text-primary-dark dark:hover:bg-muted-dark/50"
                  >
                    Lihat semua notifikasi
                  </Link>
                </motion.div>
              </>
            )}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="fixed inset-x-4 bottom-20 z-[60] flex max-h-[calc(100dvh-7rem)] flex-col overflow-y-auto overscroll-contain rounded-2xl border border-foreground/10 bg-background p-2 shadow-xl dark:bg-background-dark md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-14 md:w-64"
                >
                  <div className="px-4 py-3 border-b border-foreground/10 flex items-center gap-3">
                    <div className="w-9 h-9 overflow-hidden rounded-full bg-primary/10 text-primary dark:text-primary-dark flex items-center justify-center shrink-0">
                      {avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Hi,</p>
                      <p className="text-sm font-medium truncate" title={name}>
                        {name}
                      </p>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="mb-1 flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium hover:bg-muted dark:hover:bg-muted-dark"
                    >
                      <User className="h-4 w-4" />
                      Pengaturan Profil
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="mb-1 flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium hover:bg-muted dark:hover:bg-muted-dark"
                    >
                      <Settings className="h-4 w-4" />
                      Pengaturan
                    </Link>
                  </div>

                  <div className="h-px bg-foreground/10 mx-2 my-1" />

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AlertDialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <AlertDialogContent className="rounded-3xl p-6 md:p-8 w-[90%] max-w-sm border-foreground/10 dark:border-foreground-dark/10">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted dark:hover:bg-muted-dark text-muted-foreground dark:text-muted-foreground-dark transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8 mt-2">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-red-500" />
            </div>
            <AlertDialogTitle className="font-serif text-2xl mb-2 text-center text-foreground dark:text-foreground-dark">
              Keluar?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground dark:text-muted-foreground-dark text-sm text-center">
              Apakah Anda yakin ingin keluar dari dashboard MUA? Anda harus
              login kembali untuk masuk.
            </AlertDialogDescription>
          </div>

          <AlertDialogFooter className="flex flex-row gap-3 sm:space-x-0">
            <AlertDialogCancel
              disabled={isLoggingOut}
              className="flex-1 py-3 px-4 h-auto rounded-full mt-0 border-0 shadow-none text-foreground dark:text-foreground-dark bg-muted dark:bg-muted-dark hover:bg-muted/80 dark:hover:bg-muted-dark/80"
            >
              Batal
            </AlertDialogCancel>
            <form
              action="/auth/signout"
              method="post"
              className="flex-1 flex"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsLoggingOut(true);

                try {
                  if ("serviceWorker" in navigator && "PushManager" in window) {
                    const registration = await navigator.serviceWorker.register(
                      "/sw.js",
                      {
                        scope: "/",
                        updateViaCache: "none",
                      },
                    );
                    const existingSub = await Promise.race([
                      registration.pushManager.getSubscription(),
                      new Promise<null>((resolve) =>
                        setTimeout(() => resolve(null), 2500),
                      ),
                    ]);

                    if (existingSub) {
                      // Call server action to delete from DB
                      await unsubscribeUser(
                        (existingSub as PushSubscription).endpoint,
                      );
                      // Unsubscribe from browser
                      await (existingSub as PushSubscription).unsubscribe();
                    }
                  }
                } catch (error) {
                  console.error("Failed to unsubscribe on logout", error);
                }

                // Actually submit the form after unsubscribe is done
                (e.target as HTMLFormElement).submit();
              }}
            >
              <Button
                variant="destructive"
                disabled={isLoggingOut}
                type="submit"
                className="w-full flex-1 py-3 px-4 h-auto rounded-full font-medium flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Keluar...
                  </>
                ) : (
                  "Ya, Keluar"
                )}
              </Button>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
