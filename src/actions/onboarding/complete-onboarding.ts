"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { enterprises, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

// Schema de validação Zod para perfil
const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .transform((val) => {
      // Remove caracteres não numéricos para normalizar
      const clean = val.replace(/\D/g, "");
      // Remove DDI se presente (55) para salvar apenas o número nacional
      const hasDDI = clean.startsWith("55");
      const phoneNumber = hasDDI && clean.length >= 12 ? clean.slice(2) : clean;
      return phoneNumber;
    })
    .refine((val) => val.length === 11, {
      message: "Telefone deve ter exatamente 11 dígitos",
    }),
});

type CompleteOnboardingInput = {
  // Dados do perfil
  profileName: string;
  profilePhone: string;
};

export async function completeOnboarding(data: CompleteOnboardingInput) {
  try {
    // Verificar autenticação
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Buscar empresas na tabela e pegar o ID da primeira encontrada
    const enterprisesList = await db.select().from(enterprises).limit(1);

    if (enterprisesList.length === 0) {
      return {
        success: false,
        error: "Nenhuma empresa encontrada no sistema",
      };
    }

    const enterpriseId = enterprisesList[0].id;

    // Validar dados do perfil
    const validatedProfile = profileSchema.parse({
      name: data.profileName,
      phone: data.profilePhone,
    });

    // Verificar se profile já existe
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (existingProfile.length > 0) {
      return {
        success: false,
        error:
          "Perfil já existe. Use a página de configurações para atualizar.",
      };
    }

    const now = new Date();

    // Criar perfil associado à empresa
    await db.insert(profiles).values({
      id: user.id,
      email: user.email,
      name: validatedProfile.name,
      phone: validatedProfile.phone,
      enterprise_id: enterpriseId,
      created_at: now,
      updated_at: now,
    });

    revalidatePath("/onboarding");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error completing onboarding:", error);

    // Tratar erros de validação Zod
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || "Dados inválidos",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao completar onboarding",
    };
  }
}
