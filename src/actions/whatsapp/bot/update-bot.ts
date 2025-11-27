"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { whatsappBots, projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const updateBotSchema = z.object({
  id: z.string().uuid("ID inválido"),
  instance_id: z.string().min(1, "Instance ID é obrigatório").optional(),
  api_token: z.string().min(1, "API Token é obrigatório").optional(),
  webhook_url: z.string().url("URL inválida").optional().nullable().or(z.literal("")).transform((val) => (val === "" ? null : val)),
  status: z.enum(["active", "inactive"]).optional(),
});

type UpdateBotInput = {
  id: string;
  instance_id?: string;
  api_token?: string;
  webhook_url?: string | null;
  status?: "active" | "inactive";
};

export async function updateBot(data: UpdateBotInput) {
  try {
    const validatedData = updateBotSchema.parse(data);

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
      .where(eq(whatsappBots.id, validatedData.id))
      .limit(1);

    if (botData.length === 0) {
      return {
        success: false,
        error: "Bot não encontrado",
      };
    }

    const { bot, project } = botData[0];

    if (project.enterprise_id !== profile.enterprise_id) {
      return {
        success: false,
        error: "Você não tem permissão para editar este bot",
      };
    }

    const updateData: Partial<typeof whatsappBots.$inferInsert> = {
      updated_at: new Date(),
    };

    if (validatedData.instance_id !== undefined) {
      updateData.instance_id = validatedData.instance_id;
    }
    if (validatedData.api_token !== undefined) {
      updateData.api_token = validatedData.api_token;
    }
    if (validatedData.webhook_url !== undefined) {
      updateData.webhook_url = validatedData.webhook_url;
    }
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }

    const [updatedBot] = await db
      .update(whatsappBots)
      .set(updateData)
      .where(eq(whatsappBots.id, validatedData.id))
      .returning();

    revalidatePath(`/projects/${bot.project_id}/whatsapp`);
    return { success: true, data: updatedBot };
  } catch (error) {
    console.error("Error updating bot:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar bot",
    };
  }
}

