import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import db from "@/db";
import { AccountClient } from "./_components/account-client";

export default async function AccountSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Buscar dados do perfil
  const profileData = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  // Se perfil não existe, redirecionar para onboarding
  if (profileData.length === 0) {
    redirect("/onboarding");
  }

  const profile = profileData[0];

  return (
    <AccountClient
      profile={{
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
      }}
      userEmail={user.email || ""}
    />
  );
}

