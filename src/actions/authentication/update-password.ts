"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validação básica
  if (password !== confirmPassword) {
    redirect(
      "/auth/reset-password?error=" +
        encodeURIComponent("As senhas não coincidem")
    );
  }

  if (password.length < 6) {
    redirect(
      "/auth/reset-password?error=" +
        encodeURIComponent("A senha deve ter pelo menos 6 caracteres")
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/?passwordUpdated=true");
}
