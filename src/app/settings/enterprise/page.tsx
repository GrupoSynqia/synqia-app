import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { profiles, enterprises } from "@/db/schema";
import { eq } from "drizzle-orm";
import db from "@/db";
import { EnterpriseClient } from "./_components/enterprise-client";

export default async function EnterpriseSettingsPage() {
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

  // Buscar dados da empresa
  const enterpriseData = await db
    .select()
    .from(enterprises)
    .where(eq(enterprises.id, profile.enterprise_id))
    .limit(1);

  // Se empresa não existe, redirecionar
  if (enterpriseData.length === 0) {
    redirect("/dashboard");
  }

  const enterprise = enterpriseData[0];

  return <EnterpriseClient enterprise={enterprise} />;
}

