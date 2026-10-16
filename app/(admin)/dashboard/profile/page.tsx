import { notFound } from "next/navigation";
import { getCurrentMuaProfile } from "@/lib/profile-cache";
import { getProvinces } from "@/lib/indonesia-regions";
import ProfileForm from "./ProfileForm";
import { Card } from "@/components/ui/card";

export default async function ProfilePage() {
  const profile = await getCurrentMuaProfile();
  if (!profile) notFound();
  const provinces = await getProvinces().catch(() => []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Profil Bisnis</h1>
        <p className="mt-1 text-muted-foreground">
          Atur seluruh informasi bisnis dan halaman publik MUA Anda.
        </p>
      </div>
      <Card className="rounded-2xl bg-transparent p-0 shadow-none ring-0">
        <ProfileForm
          key={`${profile.updatedAt ?? ""}:${JSON.stringify(profile.paymentMethod ?? [])}`}
          profile={profile}
          provinces={provinces}
        />
      </Card>
    </div>
  );
}
