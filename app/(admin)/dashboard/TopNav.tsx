'use client'

import { useState } from 'react'
import { LogOut, X, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TopNav({ userEmail }: { userEmail: string | undefined }) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  return (
    <>
      <header className="bg-background border-b border-foreground/10 p-4 flex items-center justify-between sticky top-0 z-30">
        <h2 className="font-serif text-xl md:hidden">MUA Admin</h2>
        <div className="hidden md:block">
            {/* Empty space for desktop on the left if needed */}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:inline-block">{userEmail}</span>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center justify-center p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
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
                className="bg-background rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-xl pointer-events-auto relative"
              >
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-8 mt-2">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogOut className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="font-serif text-2xl mb-2">Keluar?</h3>
                  <p className="text-muted-foreground text-sm">
                    Apakah Anda yakin ingin keluar dari dashboard MUA? Anda harus login kembali untuk masuk.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="flex-1 py-3 px-4 bg-muted text-foreground font-medium rounded-full hover:bg-muted/80 transition-colors"
                  >
                    Batal
                  </button>
                  <form action="/auth/signout" method="post" className="flex-1 flex">
                    <button
                      className="flex-1 py-3 px-4 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition-colors"
                    >
                      Ya, Keluar
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
