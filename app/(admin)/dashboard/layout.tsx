import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isProfileComplete } from "@/lib/profile";
import { getCachedMuaProfile } from "@/lib/profile-cache";
import TopNav from "./TopNav";
import DashboardNavigation from "./DashboardNavigation";
import ScrollToTop from "./ScrollToTop";
import AppSetupDialog from "./components/AppSetupDialog";
import DashboardToastFlash from "./components/DashboardToastFlash";
import { Toaster } from "@/components/ui/toast";
import { Suspense } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || !session.accessToken) {
    redirect("/login");
  }

  const profile = await getCachedMuaProfile(
    session.user.id,
    session.accessToken,
  ).catch(() => session.user.profile);
  if (!isProfileComplete(profile)) {
    redirect("/onboarding");
  }

  return (
    <Toaster timeout={5000} limit={3}>
      <div className="min-h-dvh bg-muted/30 dark:bg-muted-dark/30 text-foreground dark:text-foreground-dark flex flex-col md:flex-row pb-16 md:pb-0 relative">
        <DashboardNavigation
          name={session.user.name ?? undefined}
          profileImageUrl={profile.profileImageUrl}
        />
        <ScrollToTop />
        <AppSetupDialog />
        <Suspense fallback={null}>
          <DashboardToastFlash />
        </Suspense>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden dark:bg-background-dark bg-background">
          <TopNav
            name={session.user.name ?? undefined}
            profileImageUrl={profile.profileImageUrl}
            username={profile.username ?? ""}
            homepageIsActive={profile.homepageIsActive === true}
          />

          <div className="space-y-6 p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </Toaster>
  );
}
