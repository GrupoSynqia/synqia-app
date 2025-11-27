import db from "@/db";
import { corrections, pieces_disciplines, profiles } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export type CorrectionWithDetails = {
  id: string;
  correctionTitle: string;
  disciplineName: string | null;
  correctionNote: string | null;
  favorite: boolean;
  createdAt: Date | null;
  pieceText: string;
  correctionText: unknown; // JSONB
  userName: string | null;
};

/**
 * Busca correções do usuário com filtros de busca e favoritos
 */
export async function getCorrections(
  userId: string,
  searchQuery?: string,
  favoritesOnly?: boolean
): Promise<CorrectionWithDetails[]> {
  const conditions = [eq(corrections.user_id, userId)];

  // Filtro de favoritos
  if (favoritesOnly) {
    conditions.push(eq(corrections.favorite, true));
  }

  const results = await db
    .select({
      id: corrections.id,
      correctionTitle: corrections.correction_title,
      disciplineName: pieces_disciplines.name,
      correctionNote: corrections.correction_note,
      favorite: corrections.favorite,
      createdAt: corrections.created_at,
      pieceText: corrections.piece_text,
      correctionText: corrections.correction_text,
      userName: profiles.name,
    })
    .from(corrections)
    .leftJoin(
      pieces_disciplines,
      eq(corrections.discipline_id, pieces_disciplines.id)
    )
    .leftJoin(profiles, eq(corrections.user_id, profiles.id))
    .where(and(...conditions))
    .orderBy(desc(corrections.created_at));

  // Filtro de busca (aplicado após o join para incluir discipline_name)
  if (searchQuery && searchQuery.trim()) {
    const searchPattern = searchQuery.trim().toLowerCase();
    return results.filter((correction) => {
      const matchesTitle = correction.correctionTitle
        .toLowerCase()
        .includes(searchPattern);
      const matchesDiscipline = correction.disciplineName
        ?.toLowerCase()
        .includes(searchPattern);
      const matchesPieceText = correction.pieceText
        .toLowerCase()
        .includes(searchPattern);

      // Para correction_text (JSONB), converter para string e buscar
      let matchesCorrectionText = false;
      try {
        const correctionTextStr = JSON.stringify(correction.correctionText);
        matchesCorrectionText = correctionTextStr
          .toLowerCase()
          .includes(searchPattern);
      } catch {
        // Se não conseguir converter, ignora
      }

      return (
        matchesTitle ||
        matchesDiscipline ||
        matchesPieceText ||
        matchesCorrectionText
      );
    });
  }

  return results;
}
