import { zapi } from "./zapi-client";

// Opcional: formato +55
function formatPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    return digits.startsWith("55") ? digits : `55${digits}`;
}

export async function sendWhatsappMessage(phone: string, message: string): Promise<{ messageId?: string; id?: string }> {
    try {
        const formattedPhone = formatPhoneNumber(phone);

        const response = await zapi.post("/send-text", {
            phone: formattedPhone,
            message,
        });

        // Algumas versões retornam { messageId } outras { id }
        const data = response.data ?? {};
        return { messageId: data.messageId ?? data.id, id: data.id };
    } catch (error) {
        console.error("Erro ao enviar mensagem pelo Z-API:", error);
        throw new Error("Falha ao enviar mensagem pelo WhatsApp.");
    }
}
