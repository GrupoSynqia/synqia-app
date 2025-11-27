"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { whatsappBots, projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const createBotSchema = z.object({
  project_id: z.string().uuid("ID do projeto inválido"),
  instance_id: z.string().min(1, "Instance ID é obrigatório"),
  api_token: z.string().min(1, "API Token é obrigatório"),
  webhook_url: z.string().url("URL inválida").optional().nullable().or(z.literal("")).transform((val) => (val === "" ? null : val)),
  status: z.enum(["active", "inactive"]).default("inactive"),
});

type CreateBotInput = {
  project_id: string;
  instance_id: string;
  api_token: string;
  webhook_url?: string | null;
  status?: "active" | "inactive";
};

export async function createBot(data: CreateBotInput) {
  try {
    const validatedData = createBotSchema.parse(data);

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

    const projectData = await db
      .select()
      .from(projects)
      .where(eq(projects.id, validatedData.project_id))
      .limit(1);

    if (projectData.length === 0) {
      return {
        success: false,
        error: "Projeto não encontrado",
      };
    }

    const project = projectData[0];

    if (project.enterprise_id !== profile.enterprise_id) {
      return {
        success: false,
        error: "Você não tem permissão para criar bot neste projeto",
      };
    }

    const existingBot = await db
      .select()
      .from(whatsappBots)
      .where(eq(whatsappBots.project_id, validatedData.project_id))
      .limit(1);

    if (existingBot.length > 0) {
      return {
        success: false,
        error: "Este projeto já possui um bot configurado",
      };
    }

    const [newBot] = await db
      .insert(whatsappBots)
      .values({
        project_id: validatedData.project_id,
        instance_id: validatedData.instance_id,
        api_token: validatedData.api_token,
        webhook_url: validatedData.webhook_url || null,
        status: validatedData.status || "inactive",
      })
      .returning();

    revalidatePath(`/projects/${validatedData.project_id}/whatsapp`);
    return { success: true, data: newBot };
  } catch (error) {
    console.error("Error creating bot:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar bot",
    };
  }
}

