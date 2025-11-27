"use server";

import db from "@/db";
import { projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function getProjects() {
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

    const projectsList = await db
      .select()
      .from(projects)
      .where(eq(projects.enterprise_id, profile.enterprise_id))
      .orderBy(projects.created_at);

    return { success: true, data: projectsList };
  } catch (error) {
    console.error("Error getting projects:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar projetos",
    };
  }
}

