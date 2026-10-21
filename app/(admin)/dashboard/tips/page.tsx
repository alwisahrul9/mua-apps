import { getCurrentMuaProfile } from "@/lib/profile-cache";
import { siteConfig } from "@/lib/site-config";
import GoogleBusinessGuideCard from "../components/GoogleBusinessGuideCard";

export default async function TipsPage() {
  const profile = await getCurrentMuaProfile();
  const publicProfileUrl = profile?.username
    ? `${siteConfig.url}/${encodeURIComponent(profile.username)}`
    : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Tips</h1>
        <p className="mt-1 text-muted-foreground dark:text-muted-foreground-dark">
          Panduan praktis untuk membantu lebih banyak calon klien menemukan
          bisnis MUA Anda.
        </p>
      </div>

      <GoogleBusinessGuideCard publicProfileUrl={publicProfileUrl} />
    </div>
  );
}
