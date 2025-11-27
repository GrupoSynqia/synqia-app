import db from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Busca o perfil do usuário pelo ID
 */
export async function getUserProfile(userId: string) {
  const profileData = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return profileData[0] || null;
}

