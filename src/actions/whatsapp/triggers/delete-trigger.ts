"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { whatsappTriggers, whatsappBots, projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const deleteTriggerSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

type DeleteTriggerInput = {
  id: string;
};

export async function deleteTrigger(data: DeleteTriggerInput) {
  try {
    const validatedData = deleteTriggerSchema.parse(data);

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
        error: "Você não tem permissão para deletar este trigger",
      };
    }

    await db.delete(whatsappTriggers).where(eq(whatsappTriggers.id, validatedData.id));

    revalidatePath(`/projects/${project.id}/whatsapp/triggers`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting trigger:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao deletar trigger",
    };
  }
}

