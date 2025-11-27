"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { normalizeEmail } from "@/helpers/email";
import { formatName } from "@/helpers/format-name";
import { createClient } from "@/lib/supabase/server";

// Schema de validação Zod
const updateProfileSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido")
    .transform((val) => normalizeEmail(val)),
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .transform((val) => formatName(val)),
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

// Tipo de entrada (antes das transformações)
type UpdateProfileInput = {
  email: string;
  name: string;
  phone: string;
};

export async function updateProfile(data: UpdateProfileInput) {
  try {
    // Validar dados com Zod
    const validatedData = updateProfileSchema.parse(data);

    // Verificar autenticação
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

    // Verificar se profile existe
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (existingProfile.length === 0) {
      return {
        success: false,
        error: "Perfil não encontrado",
      };
    }

    // Preparar dados para atualização
    const updateData: Partial<typeof profiles.$inferInsert> = {
      email: validatedData.email,
      name: validatedData.name,
      phone: validatedData.phone,
      updated_at: new Date(),
    };

    // Atualizar perfil
    await db.update(profiles).set(updateData).where(eq(profiles.id, user.id));

    revalidatePath("/settings/account");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);

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
        error instanceof Error ? error.message : "Erro ao atualizar perfil",
    };
  }
}
