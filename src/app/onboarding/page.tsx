import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./_components/onboarding-client";
import { getUserProfile } from "@/lib/queries/user-data";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/auth/sign-in");
  }

  // Verificar se o perfil já existe
  const profile = await getUserProfile(user.id);

  // Se o perfil já existe, redirecionar para o dashboard
  if (profile) {
    redirect("/dashboard");
  }

  return <OnboardingClient userEmail={user.email} />;
}
