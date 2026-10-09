"use client"

import { create } from "zustand"

type AppState = {
  unreadNotifications: number
  setUnreadNotifications: (count: number) => void
  decrementUnreadNotifications: () => void
  clearUnreadNotifications: () => void
}

export const useAppStore = create<AppState>((set) => ({
  unreadNotifications: 0,
  setUnreadNotifications: (count) => set({ unreadNotifications: Math.max(0, count) }),
  decrementUnreadNotifications: () => set((state) => ({ unreadNotifications: Math.max(0, state.unreadNotifications - 1) })),
  clearUnreadNotifications: () => set({ unreadNotifications: 0 }),
}))
