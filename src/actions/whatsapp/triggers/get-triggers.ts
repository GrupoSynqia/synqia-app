"use server";

import db from "@/db";
import { whatsappTriggers, whatsappBots, projects, profiles } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function getTriggers(botId: string) {
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

    const triggers = await db
      .select()
      .from(whatsappTriggers)
      .where(eq(whatsappTriggers.bot_id, botId))
      .orderBy(asc(whatsappTriggers.priority), asc(whatsappTriggers.created_at));

    return { success: true, data: triggers };
  } catch (error) {
    console.error("Error getting triggers:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar triggers",
    };
  }
}

