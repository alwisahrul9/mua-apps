"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import { markNotificationAsRead, markAllNotificationsAsRead } from './actions';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  bookingId: string | null;
  createdAt: Date;
};

const getIconForType = (type: string) => {
  switch (type) {
    case 'new_booking':
      return <Bell className="w-5 h-5 text-blue-500" />;
    case 'payment':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'cancellation':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'reminder':
      return <Clock className="w-5 h-5 text-amber-500" />;
    default:
      return <Info className="w-5 h-5 text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark" />;
  }
};

export default function NotificationListClient({ initialData }: { initialData: Notification[] }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(initialData);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const handleNotificationClick = async (notification: Notification) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
    
    if (!notification.isRead) {
      window.dispatchEvent(new CustomEvent('notificationsRead', { detail: { all: false } }));
      await markNotificationAsRead(notification.id);
    }
    
    if (notification.bookingId) {
      router.push(`/dashboard/bookings/${notification.bookingId}/edit`);
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    window.dispatchEvent(new CustomEvent('notificationsRead', { detail: { all: true } }));
    await markAllNotificationsAsRead();
    setIsMarkingAll(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif mb-1">Notifikasi</h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark">Pusat pemberitahuan aktivitas aplikasi dan pesanan Anda.</p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          disabled={isMarkingAll || !notifications.some(n => !n.isRead)}
          className="text-sm font-medium text-primary dark:text-primary-dark dark:text-primary dark:text-primary-dark hover:underline disabled:opacity-50 disabled:hover:no-underline"
        >
          {isMarkingAll ? 'Menandai...' : 'Tandai semua dibaca'}
        </button>
      </div>

      <div className="bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark rounded-2xl border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 shadow-sm overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-foreground/5">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                onClick={() => handleNotificationClick(notification)}
                className={`p-5 flex gap-4 transition-colors hover:bg-muted/50 dark:bg-muted-dark/50 dark:bg-muted dark:bg-muted-dark/50 cursor-pointer ${!notification.isRead ? 'bg-primary/5 dark:bg-primary-dark/5 dark:bg-primary dark:bg-primary-dark/5' : ''}`}
              >
                <div className="mt-1 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-background dark:bg-background-dark dark:bg-background dark:bg-background-dark border border-foreground/10 dark:border-foreground-dark/10 dark:border-foreground dark:border-foreground-dark/10 flex items-center justify-center shadow-sm">
                    {getIconForType(notification.type)}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-base ${!notification.isRead ? 'font-semibold text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark' : 'font-medium text-foreground/80 dark:text-foreground-dark/80 dark:text-foreground dark:text-foreground-dark/80'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark whitespace-nowrap ml-4">
                      {new Date(notification.createdAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className={`text-sm ${!notification.isRead ? 'text-foreground/90 dark:text-foreground-dark/90 dark:text-foreground dark:text-foreground-dark/90' : 'text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark'}`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="shrink-0 flex items-center">
                    <div className="w-2.5 h-2.5 bg-primary dark:bg-primary-dark dark:bg-primary dark:bg-primary-dark rounded-full shadow-sm shadow-primary/50 dark:shadow-primary-dark/50 dark:shadow-primary dark:shadow-primary-dark/50"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/30 dark:text-muted-foreground-dark/30 dark:text-muted-foreground dark:text-muted-foreground-dark/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark dark:text-foreground dark:text-foreground-dark mb-1">Belum ada notifikasi</h3>
            <p className="text-muted-foreground dark:text-muted-foreground-dark dark:text-muted-foreground dark:text-muted-foreground-dark text-sm">Aktivitas pesanan baru Anda akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
