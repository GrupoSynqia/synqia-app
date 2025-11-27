"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { projects, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { generateUniqueSlug } from "@/helpers/slug";

const createProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.enum(["microsaas", "ecommerce", "crm", "others"], {
    errorMap: () => ({ message: "Categoria inválida" }),
  }),
});

type CreateProjectInput = {
  name: string;
  category: "microsaas" | "ecommerce" | "crm" | "others";
};

export async function createProject(data: CreateProjectInput) {
  try {
    const validatedData = createProjectSchema.parse(data);

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

    // Verifica slugs existentes para garantir unicidade
    const existingProjects = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.enterprise_id, profile.enterprise_id));

    const existingSlugs = existingProjects.map((p) => p.slug);
    const slug = generateUniqueSlug(validatedData.name, existingSlugs);

    const [newProject] = await db
      .insert(projects)
      .values({
        name: validatedData.name,
        category: validatedData.category,
        slug: slug,
        enterprise_id: profile.enterprise_id,
      })
      .returning();

    revalidatePath("/projects");
    return { success: true, data: newProject };
  } catch (error) {
    console.error("Error creating project:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar projeto",
    };
  }
}
