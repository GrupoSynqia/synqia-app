/**
 * Gera um slug a partir de uma string
 * @param text - Texto a ser convertido em slug
 * @returns Slug normalizado (lowercase, sem acentos, espaços substituídos por hífens)
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Normaliza caracteres unicode
    .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos (acentos)
    .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Remove hífens duplicados
    .replace(/^-+|-+$/g, ""); // Remove hífens do início e fim
}

/**
 * Gera um slug único adicionando um sufixo numérico se necessário
 * @param text - Texto base para o slug
 * @param existingSlugs - Array de slugs existentes
 * @returns Slug único
 */
export function generateUniqueSlug(
  text: string,
  existingSlugs: string[] = []
): string {
  const baseSlug = generateSlug(text);
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

