"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { whatsappMenus, whatsappBots, projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const createMenuSchema = z.object({
  bot_id: z.string().uuid("ID do bot inválido"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional().nullable(),
});

type CreateMenuInput = {
  bot_id: string;
  title: string;
  description?: string | null;
};

export async function createMenu(data: CreateMenuInput) {
  try {
    const validatedData = createMenuSchema.parse(data);

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
      .where(eq(whatsappBots.id, validatedData.bot_id))
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
        error: "Você não tem permissão para criar menu neste bot",
      };
    }

    const [newMenu] = await db
      .insert(whatsappMenus)
      .values({
        bot_id: validatedData.bot_id,
        title: validatedData.title,
        description: validatedData.description || null,
      })
      .returning();

    revalidatePath(`/projects/${project.id}/whatsapp`);
    return { success: true, data: newMenu };
  } catch (error) {
    console.error("Error creating menu:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar menu",
    };
  }
}

