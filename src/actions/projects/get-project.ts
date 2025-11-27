"use server";

import db from "@/db";
import { projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function getProject(projectId: string) {
  try {
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

    const projectData = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (projectData.length === 0) {
      return {
        success: false,
        error: "Projeto não encontrado",
      };
    }

    const project = projectData[0];

    if (project.enterprise_id !== profile.enterprise_id) {
      return {
        success: false,
        error: "Você não tem permissão para acessar este projeto",
      };
    }

    return { success: true, data: project };
  } catch (error) {
    console.error("Error getting project:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar projeto",
    };
  }
}

