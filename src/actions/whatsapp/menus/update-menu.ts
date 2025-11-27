"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { whatsappMenus, whatsappBots, projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const updateMenuSchema = z.object({
  id: z.string().uuid("ID inválido"),
  title: z.string().min(1, "Título é obrigatório").optional(),
  description: z.string().optional().nullable(),
});

type UpdateMenuInput = {
  id: string;
  title?: string;
  description?: string | null;
};

export async function updateMenu(data: UpdateMenuInput) {
  try {
    const validatedData = updateMenuSchema.parse(data);

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

    const menuData = await db
      .select({
        menu: whatsappMenus,
        bot: whatsappBots,
        project: projects,
      })
      .from(whatsappMenus)
      .innerJoin(whatsappBots, eq(whatsappMenus.bot_id, whatsappBots.id))
      .innerJoin(projects, eq(whatsappBots.project_id, projects.id))
      .where(eq(whatsappMenus.id, validatedData.id))
      .limit(1);

    if (menuData.length === 0) {
      return {
        success: false,
        error: "Menu não encontrado",
      };
    }

    const { project } = menuData[0];

    if (project.enterprise_id !== profile.enterprise_id) {
      return {
        success: false,
        error: "Você não tem permissão para editar este menu",
      };
    }

    const updateData: Partial<typeof whatsappMenus.$inferInsert> = {
      updated_at: new Date(),
    };

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }

    const [updatedMenu] = await db
      .update(whatsappMenus)
      .set(updateData)
      .where(eq(whatsappMenus.id, validatedData.id))
      .returning();

    revalidatePath(`/projects/${project.id}/whatsapp`);
    return { success: true, data: updatedMenu };
  } catch (error) {
    console.error("Error updating menu:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar menu",
    };
  }
}

