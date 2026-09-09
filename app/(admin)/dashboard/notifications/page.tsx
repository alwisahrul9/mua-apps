import { getNotifications } from "./actions";
import NotificationListClient from "./NotificationListClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const { data: notifications, error } = await getNotifications();

  if (error) {
    return (
      <div className="p-12 text-center text-red-500">
        Gagal memuat notifikasi.
      </div>
    );
  }

  return <NotificationListClient initialData={notifications} />;
}
