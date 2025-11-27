"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/db";
import { enterprises, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

// Schema de validação Zod
const updateEnterpriseSchema = z.object({
  id: z.string().uuid("ID inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cep: z
    .string()
    .min(8, "CEP deve ter 8 dígitos")
    .max(8, "CEP deve ter 8 dígitos")
    .transform((val) => val.replace(/\D/g, "")),
  address: z.string().min(1, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional().nullable(),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z
    .string()
    .min(2, "Estado é obrigatório")
    .max(2, "Estado deve ter 2 caracteres")
    .transform((val) => val.toUpperCase()),
  instagram_url: z
    .string()
    .url("URL inválida")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
  phoneNumber: z
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
  register: z.string().min(1, "Registro é obrigatório"),
});

// Tipo de entrada (antes das transformações)
type UpdateEnterpriseInput = {
  id: string;
  name: string;
  cep: string;
  address: string;
  number: string;
  complement?: string | null;
  city: string;
  state: string;
  instagram_url?: string | null;
  phoneNumber: string;
  register: string;
};

export async function updateEnterprise(data: UpdateEnterpriseInput) {
  try {
    // Validar dados com Zod
    const validatedData = updateEnterpriseSchema.parse(data);

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

    // Verificar se profile existe e se tem acesso à empresa
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

    // Verificar se a empresa pertence ao perfil do usuário
    if (profile.enterprise_id !== validatedData.id) {
      return {
        success: false,
        error: "Você não tem permissão para editar esta empresa",
      };
    }

    // Verificar se enterprise existe
    const existingEnterprise = await db
      .select()
      .from(enterprises)
      .where(eq(enterprises.id, validatedData.id))
      .limit(1);

    if (existingEnterprise.length === 0) {
      return {
        success: false,
        error: "Empresa não encontrada",
      };
    }

    // Preparar dados para atualização
    const updateData: Partial<typeof enterprises.$inferInsert> = {
      name: validatedData.name,
      cep: validatedData.cep,
      address: validatedData.address,
      number: validatedData.number,
      complement: validatedData.complement || null,
      city: validatedData.city,
      state: validatedData.state,
      instagram_url: validatedData.instagram_url || null,
      phoneNumber: validatedData.phoneNumber,
      register: validatedData.register,
      updated_at: new Date(),
    };

    // Atualizar empresa
    await db
      .update(enterprises)
      .set(updateData)
      .where(eq(enterprises.id, validatedData.id));

    revalidatePath("/settings/enterprise");
    return { success: true };
  } catch (error) {
    console.error("Error updating enterprise:", error);

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
        error instanceof Error ? error.message : "Erro ao atualizar empresa",
    };
  }
}
