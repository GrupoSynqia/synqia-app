import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToBlob } from "@/helpers/blob-upload";

// Tipos de arquivo permitidos
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Tamanho máximo: 4MB (limite seguro para Vercel Functions)
const MAX_FILE_SIZE = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Obter FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "project" ou "profile"

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Arquivo não fornecido" },
        { status: 400 }
      );
    }

    if (!type || (type !== "project" && type !== "profile")) {
      return NextResponse.json(
        { success: false, error: "Tipo inválido. Use 'project' ou 'profile'" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Tipo de arquivo não permitido. Use JPG, PNG ou WEBP",
        },
        { status: 400 }
      );
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Arquivo muito grande. Tamanho máximo: 4MB",
        },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
    const path = `${type}s/${filename}`;

    // Fazer upload
    const url = await uploadToBlob(file, path);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao fazer upload do arquivo",
      },
      { status: 500 }
    );
  }
}

