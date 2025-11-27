"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { whatsappTriggers, whatsappBots, projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const createTriggerSchema = z.object({
  bot_id: z.string().uuid("ID do bot inválido"),
  trigger_text: z.string().min(1, "Texto do gatilho é obrigatório"),
  match_type: z.enum(["exact", "contains", "starts_with", "regex"]).default("exact"),
  priority: z.number().int().default(0),
  response_id: z.string().uuid("ID da resposta inválido"),
  is_active: z.boolean().default(true),
});

type CreateTriggerInput = {
  bot_id: string;
  trigger_text: string;
  match_type?: "exact" | "contains" | "starts_with" | "regex";
  priority?: number;
  response_id: string;
  is_active?: boolean;
};

export async function createTrigger(data: CreateTriggerInput) {
  try {
    const validatedData = createTriggerSchema.parse(data);

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
        error: "Você não tem permissão para criar trigger neste bot",
      };
    }

    const [newTrigger] = await db
      .insert(whatsappTriggers)
      .values({
        bot_id: validatedData.bot_id,
        trigger_text: validatedData.trigger_text,
        match_type: validatedData.match_type || "exact",
        priority: validatedData.priority ?? 0,
        response_id: validatedData.response_id,
        is_active: validatedData.is_active ?? true,
      })
      .returning();

    revalidatePath(`/projects/${project.id}/whatsapp/triggers`);
    return { success: true, data: newTrigger };
  } catch (error) {
    console.error("Error creating trigger:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar trigger",
    };
  }
}

