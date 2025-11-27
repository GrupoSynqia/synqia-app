// src/helpers/email.ts

/**
 * Normaliza um email removendo espaços e convertendo para lowercase
 * @param email - Email a ser normalizado
 * @returns Email normalizado ou string vazia se inválido
 */
export const normalizeEmail = (
  email: string | null | undefined
): string => {
  if (typeof email !== "string") return "";

  // Remove espaços no início e fim, converte para lowercase
  const normalized = email.trim().toLowerCase();

  // Validação básica de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return "";
  }

  return normalized;
};

/**
 * Valida se um email tem formato válido
 * @param email - Email a ser validado
 * @returns true se o email é válido, false caso contrário
 */
export const isValidEmail = (email: string | null | undefined): boolean => {
  if (typeof email !== "string") return false;
  const normalized = normalizeEmail(email);
  return normalized.length > 0;
};

