"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const deleteProjectSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

type DeleteProjectInput = {
  id: string;
};

export async function deleteProject(data: DeleteProjectInput) {
  try {
    const validatedData = deleteProjectSchema.parse(data);

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

    const profileData = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (profileData.length === 0) {
      return {
        success: false,
        error: "Perfil não encontrado",
      };
    }

    const profile = profileData[0];

    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.id, validatedData.id))
      .limit(1);

    if (existingProject.length === 0) {
      return {
        success: false,
        error: "Projeto não encontrado",
      };
    }

    const project = existingProject[0];

    if (project.enterprise_id !== profile.enterprise_id) {
      return {
        success: false,
        error: "Você não tem permissão para deletar este projeto",
      };
    }

    await db.delete(projects).where(eq(projects.id, validatedData.id));

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao deletar projeto",
    };
  }
}

