import { listDashboardReviews, listAllServices } from "@/lib/api/dashboard";
import ReviewListClient from "./ReviewListClient";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const [initialReviews, services] = await Promise.all([
    listDashboardReviews(),
    listAllServices(),
  ]);

  return (
    <ReviewListClient
      services={services}
      initialReviews={initialReviews.data}
      initialPage={initialReviews.currentPage ?? 1}
      initialLastPage={initialReviews.lastPage ?? 1}
      initialTotal={initialReviews.total ?? initialReviews.data.length}
    />
  );
}
