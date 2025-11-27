"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const updateProjectSchema = z.object({
  id: z.string().uuid("ID inválido"),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

type UpdateProjectInput = {
  id: string;
  name: string;
  description: string;
};

export async function updateProject(data: UpdateProjectInput) {
  try {
    const validatedData = updateProjectSchema.parse(data);

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
        error: "Você não tem permissão para editar este projeto",
      };
    }

    const [updatedProject] = await db
      .update(projects)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        updated_at: new Date(),
      })
      .where(eq(projects.id, validatedData.id))
      .returning();

    revalidatePath("/projects");
    revalidatePath(`/projects/${validatedData.id}`);
    return { success: true, data: updatedProject };
  } catch (error) {
    console.error("Error updating project:", error);

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
        error instanceof Error ? error.message : "Erro ao atualizar projeto",
    };
  }
}

