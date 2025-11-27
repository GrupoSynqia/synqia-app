"use server";

import db from "@/db";
import { whatsappResponses, whatsappBots, projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function getResponses(botId: string) {
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

    const botData = await db
      .select({
        bot: whatsappBots,
        project: projects,
      })
      .from(whatsappBots)
      .innerJoin(projects, eq(whatsappBots.project_id, projects.id))
      .where(eq(whatsappBots.id, botId))
      .limit(1);

    if (botData.length === 0) {
      return {
        success: false,
        error: "Bot não encontrado",
      };
    }

    const { project } = botData[0];

    if (project.enterprise_id !== profile.enterprise_id) {
      return {
        success: false,
        error: "Você não tem permissão para acessar este bot",
      };
    }

    const responses = await db
      .select()
      .from(whatsappResponses)
      .where(eq(whatsappResponses.bot_id, botId))
      .orderBy(whatsappResponses.created_at);

    return { success: true, data: responses };
  } catch (error) {
    console.error("Error getting responses:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar respostas",
    };
  }
}

