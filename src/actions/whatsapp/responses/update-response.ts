"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { whatsappResponses, whatsappBots, whatsappMenus, projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const updateResponseSchema = z.object({
  id: z.string().uuid("ID inválido"),
  response_text: z.string().optional().nullable(),
  response_type: z.enum(["text", "menu", "flow"]).optional(),
  menu_id: z.string().uuid("ID do menu inválido").optional().nullable(),
});

type UpdateResponseInput = {
  id: string;
  response_text?: string | null;
  response_type?: "text" | "menu" | "flow";
  menu_id?: string | null;
};

export async function updateResponse(data: UpdateResponseInput) {
  try {
    const validatedData = updateResponseSchema.parse(data);

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

    const responseData = await db
      .select({
        response: whatsappResponses,
        bot: whatsappBots,
        project: projects,
      })
      .from(whatsappResponses)
      .innerJoin(whatsappBots, eq(whatsappResponses.bot_id, whatsappBots.id))
      .innerJoin(projects, eq(whatsappBots.project_id, projects.id))
      .where(eq(whatsappResponses.id, validatedData.id))
      .limit(1);

    if (responseData.length === 0) {
      return {
        success: false,
        error: "Resposta não encontrada",
      };
    }

    const { project } = responseData[0];

    if (project.enterprise_id !== profile.enterprise_id) {
      return {
        success: false,
        error: "Você não tem permissão para editar esta resposta",
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

    const updateData: Partial<typeof whatsappResponses.$inferInsert> = {
      updated_at: new Date(),
    };

    if (validatedData.response_text !== undefined) {
      updateData.response_text = validatedData.response_text;
    }
    if (validatedData.response_type !== undefined) {
      updateData.response_type = validatedData.response_type;
    }
    if (validatedData.menu_id !== undefined) {
      updateData.menu_id = validatedData.menu_id;
    }

    const [updatedResponse] = await db
      .update(whatsappResponses)
      .set(updateData)
      .where(eq(whatsappResponses.id, validatedData.id))
      .returning();

    revalidatePath(`/projects/${project.id}/whatsapp/responses`);
    return { success: true, data: updatedResponse };
  } catch (error) {
    console.error("Error updating response:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar resposta",
    };
  }
}

