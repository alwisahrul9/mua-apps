import { notFound } from "next/navigation";
import { serverApi } from "@/lib/api/server";
import { extractMuaProfile } from "@/lib/profile";
import { getProvinces } from "@/lib/indonesia-regions";
import ProfileForm from "./ProfileForm";
import { Card } from "@/components/ui/card";

export default async function ProfilePage() {
  const response = await (await serverApi())
    .get("/user/profile")
    .catch(() => null);
  if (!response) notFound();
  const profile = extractMuaProfile(response.data);
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
        <ProfileForm profile={profile} provinces={provinces} />
      </Card>
    </div>
  );
}
