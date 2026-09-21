'use client'

import { useState } from 'react'
import { LogOut, X, Loader2, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PushNotificationManager } from './components/PushNotificationManager'
import { unsubscribeUser } from './notifications/push-actions'

export default function TopNav({ userEmail }: { userEmail: string | undefined }) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <>
      <header className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border-b border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 p-4 flex items-center justify-between sticky top-0 z-30">
        <h2 className="font-serif text-xl md:hidden">MUA Admin</h2>
        <div className="hidden md:block">
          {/* Empty space for desktop on the left if needed */}
        </div>
        <div className="flex items-center gap-4 relative">
          <PushNotificationManager />

          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary dark:text-primary-dark hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Profil"
          >
            <User className="w-5 h-5" />
          </button>

          <AnimatePresence>
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
                  className="absolute top-14 right-0 w-64 bg-background dark:bg-background-dark border border-foreground/10 rounded-2xl shadow-lg p-2 z-50 flex flex-col"
                >
                  <div className="px-4 py-3 border-b border-foreground/10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary dark:text-primary-dark" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Hi,</p>
                      <p className="text-sm font-medium truncate" title={userEmail}>{userEmail}</p>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="flex items-center justify-between px-2 py-2">
                      <span className="text-sm font-medium">Tema Gelap</span>
                      <ThemeToggle />
                    </div>
                  </div>

                  <div className="h-px bg-foreground/10 mx-2 my-1" />

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false)
                        setIsLogoutModalOpen(true)
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

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsLogoutModalOpen(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-xl pointer-events-auto relative"
              >
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-8 mt-2">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogOut className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="font-serif text-2xl mb-2">Keluar?</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark text-sm">
                    Apakah Anda yakin ingin keluar dari dashboard MUA? Anda harus login kembali untuk masuk.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsLogoutModalOpen(false)}
                    disabled={isLoggingOut}
                    className="flex-1 py-3 px-4 bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark font-medium rounded-full hover:bg-muted/80 dark:bg-muted-dark/80 dark:bg-muted dark:bg-muted-dark/80 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <form action="/auth/signout" method="post" className="flex-1 flex" onSubmit={async (e) => {
                    e.preventDefault();
                    setIsLoggingOut(true);

                    try {
                      if ("serviceWorker" in navigator && "PushManager" in window) {
                        const registration = await navigator.serviceWorker.ready;
                        const existingSub = await registration.pushManager.getSubscription();

                        if (existingSub) {
                          // Call server action to delete from DB
                          await unsubscribeUser(existingSub.endpoint);
                          // Unsubscribe from browser
                          await existingSub.unsubscribe();
                        }
                      }
                    } catch (error) {
                      console.error("Failed to unsubscribe on logout", error);
                    }

                    // Actually submit the form after unsubscribe is done
                    (e.target as HTMLFormElement).submit();
                  }}>
                    <button
                      disabled={isLoggingOut}
                      className="flex-1 py-3 px-4 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoggingOut ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Keluar...
                        </>
                      ) : (
                        'Ya, Keluar'
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
