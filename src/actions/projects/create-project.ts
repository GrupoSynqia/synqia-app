"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const createProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

type CreateProjectInput = {
  name: string;
  description: string;
};

export async function createProject(data: CreateProjectInput) {
  try {
    const validatedData = createProjectSchema.parse(data);

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

    const [newProject] = await db
      .insert(projects)
      .values({
        name: validatedData.name,
        description: validatedData.description,
        enterprise_id: profile.enterprise_id,
      })
      .returning();

    revalidatePath("/projects");
    return { success: true, data: newProject };
  } catch (error) {
    console.error("Error creating project:", error);

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
        error instanceof Error ? error.message : "Erro ao criar projeto",
    };
  }
}

