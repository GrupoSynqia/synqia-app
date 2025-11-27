"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { whatsappTriggers, whatsappBots, projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const updateTriggerSchema = z.object({
  id: z.string().uuid("ID inválido"),
  trigger_text: z.string().min(1, "Texto do gatilho é obrigatório").optional(),
  match_type: z.enum(["exact", "contains", "starts_with", "regex"]).optional(),
  priority: z.number().int().optional(),
  response_id: z.string().uuid("ID da resposta inválido").optional(),
  is_active: z.boolean().optional(),
});

type UpdateTriggerInput = {
  id: string;
  trigger_text?: string;
  match_type?: "exact" | "contains" | "starts_with" | "regex";
  priority?: number;
  response_id?: string;
  is_active?: boolean;
};

export async function updateTrigger(data: UpdateTriggerInput) {
  try {
    const validatedData = updateTriggerSchema.parse(data);

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

    const triggerData = await db
      .select({
        trigger: whatsappTriggers,
        bot: whatsappBots,
        project: projects,
      })
      .from(whatsappTriggers)
      .innerJoin(whatsappBots, eq(whatsappTriggers.bot_id, whatsappBots.id))
      .innerJoin(projects, eq(whatsappBots.project_id, projects.id))
      .where(eq(whatsappTriggers.id, validatedData.id))
      .limit(1);

    if (triggerData.length === 0) {
      return {
        success: false,
        error: "Trigger não encontrado",
      };
    }

    const { project } = triggerData[0];

    if (project.enterprise_id !== profile.enterprise_id) {
      return {
        success: false,
        error: "Você não tem permissão para editar este trigger",
      };
    }

    const updateData: Partial<typeof whatsappTriggers.$inferInsert> = {
      updated_at: new Date(),
    };

    if (validatedData.trigger_text !== undefined) {
      updateData.trigger_text = validatedData.trigger_text;
    }
    if (validatedData.match_type !== undefined) {
      updateData.match_type = validatedData.match_type;
    }
    if (validatedData.priority !== undefined) {
      updateData.priority = validatedData.priority;
    }
    if (validatedData.response_id !== undefined) {
      updateData.response_id = validatedData.response_id;
    }
    if (validatedData.is_active !== undefined) {
      updateData.is_active = validatedData.is_active;
    }

    const [updatedTrigger] = await db
      .update(whatsappTriggers)
      .set(updateData)
      .where(eq(whatsappTriggers.id, validatedData.id))
      .returning();

    revalidatePath(`/projects/${project.id}/whatsapp/triggers`);
    return { success: true, data: updatedTrigger };
  } catch (error) {
    console.error("Error updating trigger:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar trigger",
    };
  }
}

