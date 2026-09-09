'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, List, Bell, Briefcase, Globe } from 'lucide-react'
import { createClient } from '../../../utils/supabase/client'
import { getUnreadNotificationsCount } from './notifications/actions'

export default function DashboardNavigation({ userEmail }: { userEmail: string | undefined }) {
  const pathname = usePathname()
  const router = useRouter()
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)

  useEffect(() => {
    // 1. Fetch initial unread count
    const fetchInitialCount = async () => {
      const { count } = await getUnreadNotificationsCount()
      if (count !== undefined) {
        setUnreadNotificationsCount(count)
      }
    }
    fetchInitialCount()

    // 2. Request Browser Notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    // 3. Setup Supabase Realtime
    const supabase = createClient()
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          setUnreadNotificationsCount((prev) => prev + 1)

          console.log(payload)

          if ("Notification" in window && Notification.permission === "granted") {
            const notification = new Notification(payload.new.title, {
              body: payload.new.message,
            })

            notification.onclick = function () {
              window.focus()
              if (payload.new.bookingId) {
                router.push(`/dashboard/bookings/${payload.new.bookingId}/edit`)
              } else {
                router.push(`/dashboard/notifications`)
              }
              notification.close()
            }
          }
        }
      )
      .subscribe()

    const handleNotificationsRead = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.all) {
        setUnreadNotificationsCount(0);
      } else {
        setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('notificationsRead', handleNotificationsRead);

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('notificationsRead', handleNotificationsRead);
    }
  }, [router])

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: Home, exact: true },
    { name: 'Bookings', href: '/dashboard/bookings', icon: List, exact: false },
    { name: 'Layanan', href: '/dashboard/services', icon: Briefcase, exact: false },
    { name: 'Notifikasi', href: '/dashboard/notifications', icon: Bell, exact: false, badge: unreadNotificationsCount },
    { name: 'Portofolio', href: '/dashboard/portfolios', icon: Globe, exact: true },
  ]

  const isNavActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Sidebar (Hidden on mobile/tablet) */}
      <aside className="w-64 bg-background dark:bg-background-dark border-r border-foreground/10 dark:border-foreground-dark/10 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <h2 className="font-serif text-2xl">MUA Admin</h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark mt-1 truncate">{userEmail}</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const active = isNavActive(item.href, item.exact)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                  ? 'bg-primary text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground-dark'
                  : 'hover:bg-muted text-foreground/80 dark:hover:bg-muted-dark dark:text-foreground-dark/80'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
                {item.badge ? (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-primary-foreground text-primary dark:bg-primary-foreground-dark dark:text-primary-dark' : 'bg-primary text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground-dark'}`}>
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

      </aside>

      {/* Mobile Bottom Navbar (Hidden on desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background dark:bg-background-dark border-t border-foreground/10 dark:border-foreground-dark/10 pb-safe z-40">
        <nav className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const active = isNavActive(item.href, item.exact)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center gap-1 p-2 w-16 transition-colors ${active ? 'text-primary dark:text-primary-dark' : 'text-muted-foreground dark:text-muted-foreground-dark'
                  }`}
              >
                <div className="relative">
                  <item.icon className="w-6 h-6" />
                  {item.badge ? (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary dark:bg-primary-dark ring-2 ring-background dark:ring-background-dark">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-primary-dark opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-primary-dark"></span>
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

    </>
  )
}
