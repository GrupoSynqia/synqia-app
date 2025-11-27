import { put } from "@vercel/blob";

/**
 * Faz upload de um arquivo para o Vercel Blob Storage
 * @param file - Arquivo a ser enviado
 * @param path - Caminho onde o arquivo será armazenado (ex: "projects/logo.png" ou "profiles/avatar.png")
 * @returns URL do arquivo no Blob Storage
 * @throws Error se o token não estiver configurado ou se o upload falhar
 */
export async function uploadToBlob(file: File, path: string): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN não está configurado no ambiente");
  }

  try {
    const blob = await put(path, file, {
      access: "public",
      token,
    });

    return blob.url;
  } catch (error) {
    console.error("Erro ao fazer upload para Vercel Blob:", error);
    throw new Error(
      error instanceof Error
        ? `Erro ao fazer upload: ${error.message}`
        : "Erro desconhecido ao fazer upload"
    );
  }
}
