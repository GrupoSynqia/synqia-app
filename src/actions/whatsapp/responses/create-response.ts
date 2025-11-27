"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { whatsappResponses, whatsappBots, whatsappMenus, projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const createResponseSchema = z.object({
  bot_id: z.string().uuid("ID do bot inválido"),
  response_text: z.string().optional().nullable(),
  response_type: z.enum(["text", "menu", "flow"]).default("text"),
  menu_id: z.string().uuid("ID do menu inválido").optional().nullable(),
});

type CreateResponseInput = {
  bot_id: string;
  response_text?: string | null;
  response_type?: "text" | "menu" | "flow";
  menu_id?: string | null;
};

export async function createResponse(data: CreateResponseInput) {
  try {
    const validatedData = createResponseSchema.parse(data);

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
        error: "Você não tem permissão para criar resposta neste bot",
      };
    }

    if (validatedData.response_type === "menu" && !validatedData.menu_id) {
      return {
        success: false,
        error: "Menu ID é obrigatório para respostas do tipo menu",
      };
    }

    if (validatedData.menu_id) {
      const menuData = await db
        .select()
        .from(whatsappMenus)
        .where(eq(whatsappMenus.id, validatedData.menu_id))
        .limit(1);

      if (menuData.length === 0) {
        return {
          success: false,
          error: "Menu não encontrado",
        };
      }
    }

    const [newResponse] = await db
      .insert(whatsappResponses)
      .values({
        bot_id: validatedData.bot_id,
        response_text: validatedData.response_text || null,
        response_type: validatedData.response_type || "text",
        menu_id: validatedData.menu_id || null,
      })
      .returning();

    revalidatePath(`/projects/${project.id}/whatsapp/responses`);
    return { success: true, data: newResponse };
  } catch (error) {
    console.error("Error creating response:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar resposta",
    };
  }
}

