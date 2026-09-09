"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DeleteButton({ action }: { action: () => void }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white h-11 px-6 shadow-sm"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Hapus
      </button>
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark rounded-2xl p-6 w-[90%] max-w-md shadow-xl border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10"
            >
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark mb-2">Konfirmasi Hapus</h3>
              <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark mb-6">
                Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark hover:bg-muted dark:bg-muted-dark dark:bg-muted dark:bg-muted-dark h-10 px-4"
                >
                  Batal
                </button>
                <form action={action}>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors bg-red-500 text-white hover:bg-red-600 h-10 px-4 shadow-sm"
                  >
                    Ya, Hapus
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
