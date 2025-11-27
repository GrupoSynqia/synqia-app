"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import db from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function deleteProfile() {
  try {
    // Verificar autenticação
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Verificar se profile existe
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (existingProfile.length === 0) {
      return {
        success: false,
        error: "Perfil não encontrado",
      };
    }

    // Deletar perfil
    await db.delete(profiles).where(eq(profiles.id, user.id));

    // Fazer logout do usuário antes de deletar da autenticação
    await supabase.auth.signOut();

    // Deletar usuário da tabela auth.users do Supabase
    const adminClient = createAdminClient();
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteUserError) {
      console.error("Error deleting user from auth:", deleteUserError);
      // Não retornar erro aqui, pois o perfil já foi deletado
      // O usuário pode ser deletado manualmente depois se necessário
    }

    // Revalidar cache e redirecionar
    revalidatePath("/", "layout");
    redirect("/");
  } catch (error) {
    // Verificar se é um erro de redirecionamento do Next.js
    // Se for, re-lançar para que o Next.js processe corretamente
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error deleting profile:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir perfil",
    };
  }
}
