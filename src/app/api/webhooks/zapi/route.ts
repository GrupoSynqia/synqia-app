import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import {
  whatsappBots,
  whatsappContacts,
  whatsappMessages,
  whatsappTriggers,
  whatsappResponses,
  whatsappMenus,
  whatsappMenuOptions,
} from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { sendWhatsappMessage } from "@/lib/zapi/zapi-service";

// Tipo do payload do webhook Z-API
type ZApiWebhookMessage = {
  isStatusReply: boolean;
  chatLid: string;
  connectedPhone: string;
  waitingMessage: boolean;
  isEdit: boolean;
  isGroup: boolean;
  isNewsletter: boolean;
  instanceId: string;
  messageId: string;
  phone: string;
  fromMe: boolean;
  momment: number;
  status: string;
  chatName: string;
  senderPhoto: string | null;
  senderName: string;
  photo: string | null;
  broadcast: boolean;
  participantLid: string | null;
  forwarded: boolean;
  type: string;
  fromApi: boolean;
  text?: {
    message: string;
  };
  _traceContext?: {
    traceId: string;
    spanId: string;
  };
};

// Função para verificar match de trigger
function checkTriggerMatch(
  messageText: string,
  triggerText: string,
  matchType: string
): boolean {
  const lowerMessage = messageText.toLowerCase();
  const lowerTrigger = triggerText.toLowerCase();

  switch (matchType) {
    case "exact":
      return lowerMessage === lowerTrigger;
    case "contains":
      return lowerMessage.includes(lowerTrigger);
    case "starts_with":
      return lowerMessage.startsWith(lowerTrigger);
    case "regex":
      try {
        const regex = new RegExp(triggerText, "i");
        return regex.test(messageText);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

// Função para formatar mensagem de menu
async function formatMenuMessage(menuId: string): Promise<string> {
  const menuData = await db
    .select()
    .from(whatsappMenus)
    .where(eq(whatsappMenus.id, menuId))
    .limit(1);

  if (menuData.length === 0) {
    return "";
  }

  const menu = menuData[0];

  const options = await db
    .select()
    .from(whatsappMenuOptions)
    .where(eq(whatsappMenuOptions.menu_id, menuId))
    .orderBy(asc(whatsappMenuOptions.order));

  let message = `*${menu.title}*\n\n`;

  if (menu.description) {
    message += `${menu.description}\n\n`;
  }

  options.forEach((option, index) => {
    message += `${index + 1}. ${option.option_text}\n`;
  });

  return message.trim();
}

// Função para processar uma mensagem individual
async function processMessage(message: ZApiWebhookMessage) {
  try {
    // Validar se é mensagem recebida
    if (
      message.fromMe ||
      message.isGroup ||
      message.type !== "ReceivedCallback"
    ) {
      return;
    }

    // Validar se tem texto
    if (!message.text?.message) {
      return;
    }

    const messageText = message.text.message;

    // Buscar bot pelo instanceId
    const botData = await db
      .select()
      .from(whatsappBots)
      .where(eq(whatsappBots.instance_id, message.instanceId))
      .limit(1);

    if (botData.length === 0) {
      console.log(`Bot não encontrado para instanceId: ${message.instanceId}`);
      return;
    }

    const bot = botData[0];

    // Verificar se bot está ativo
    if (bot.status !== "active") {
      console.log(`Bot ${bot.id} está inativo`);
      return;
    }

    // Buscar ou criar contato
    const contact = await db
      .select()
      .from(whatsappContacts)
      .where(
        and(
          eq(whatsappContacts.bot_id, bot.id),
          eq(whatsappContacts.phone, message.phone)
        )
      )
      .limit(1);

    let contactId: string;

    if (contact.length === 0) {
      const [newContact] = await db
        .insert(whatsappContacts)
        .values({
          bot_id: bot.id,
          phone: message.phone,
          name: message.senderName || message.chatName,
          last_interaction_at: new Date(message.momment),
        })
        .returning();
      contactId = newContact.id;
    } else {
      contactId = contact[0].id;
      // Atualizar contato
      await db
        .update(whatsappContacts)
        .set({
          name: message.senderName || message.chatName || contact[0].name,
          last_interaction_at: new Date(message.momment),
          updated_at: new Date(),
        })
        .where(eq(whatsappContacts.id, contactId));
    }

    // Salvar mensagem recebida
    await db.insert(whatsappMessages).values({
      bot_id: bot.id,
      contact_id: contactId,
      phone: message.phone,
      message_id: message.messageId,
      direction: "incoming",
      message_text: messageText,
      message_type: "text",
    });

    // Buscar triggers ativos ordenados por prioridade
    const triggers = await db
      .select()
      .from(whatsappTriggers)
      .where(
        and(
          eq(whatsappTriggers.bot_id, bot.id),
          eq(whatsappTriggers.is_active, true)
        )
      )
      .orderBy(
        asc(whatsappTriggers.priority),
        asc(whatsappTriggers.created_at)
      );

    // Verificar match com triggers
    let matchedTrigger = null;
    for (const trigger of triggers) {
      if (
        checkTriggerMatch(messageText, trigger.trigger_text, trigger.match_type)
      ) {
        matchedTrigger = trigger;
        break;
      }
    }

    if (!matchedTrigger) {
      console.log(`Nenhum trigger encontrado para mensagem: ${messageText}`);
      return;
    }

    // Buscar resposta associada
    const responseData = await db
      .select()
      .from(whatsappResponses)
      .where(eq(whatsappResponses.id, matchedTrigger.response_id))
      .limit(1);

    if (responseData.length === 0) {
      console.log(`Resposta não encontrada para trigger: ${matchedTrigger.id}`);
      return;
    }

    const response = responseData[0];

    // Formatar mensagem de resposta
    let replyMessage = "";

    if (response.response_type === "menu" && response.menu_id) {
      replyMessage = await formatMenuMessage(response.menu_id);
    } else if (response.response_type === "text" && response.response_text) {
      replyMessage = response.response_text;
    } else {
      console.log(
        `Tipo de resposta não suportado ou sem conteúdo: ${response.response_type}`
      );
      return;
    }

    if (!replyMessage) {
      console.log(`Mensagem de resposta vazia para resposta: ${response.id}`);
      return;
    }

    // Enviar resposta via Z-API
    try {
      const result = await sendWhatsappMessage(message.phone, replyMessage);
      const messageId = result.messageId || result.id;

      // Salvar mensagem enviada
      await db.insert(whatsappMessages).values({
        bot_id: bot.id,
        contact_id: contactId,
        phone: message.phone,
        message_id: messageId || null,
        direction: "outgoing",
        message_text: replyMessage,
        message_type: response.response_type,
      });

      console.log(`Resposta enviada com sucesso para ${message.phone}`);
    } catch (error) {
      console.error(`Erro ao enviar resposta via Z-API:`, error);
      // Não lançar erro para não quebrar o webhook
    }
  } catch (error) {
    console.error(`Erro ao processar mensagem:`, error);
    // Não lançar erro para não quebrar o webhook
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar Content-Type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Content-Type inválido:", contentType);
      return NextResponse.json(
        { error: "Content-Type deve ser application/json" },
        { status: 400 }
      );
    }

    // Ler o body como texto primeiro para melhor tratamento de erros
    let bodyText: string;
    try {
      bodyText = await request.text();
    } catch (error) {
      console.error("Erro ao ler body:", error);
      return NextResponse.json(
        { error: "Erro ao ler body da requisição" },
        { status: 400 }
      );
    }

    // Verificar se o body não está vazio
    if (!bodyText || bodyText.trim() === "") {
      console.error("Body vazio recebido");
      return NextResponse.json({ error: "Body vazio" }, { status: 400 });
    }

    // Fazer parse do JSON
    let body: unknown;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError);
      console.error(
        "Body recebido (primeiros 500 chars):",
        bodyText.substring(0, 500)
      );
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    // Log do payload recebido para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV === "development") {
      console.log("Payload recebido:", JSON.stringify(body, null, 2));
      console.log(
        "Tipo do payload:",
        Array.isArray(body) ? "array" : typeof body
      );
    }

    // Validar que é um array e converter se necessário
    let messages: ZApiWebhookMessage[];
    if (!Array.isArray(body)) {
      console.error("Payload não é um array. Tipo recebido:", typeof body);
      // Se for um objeto único, converter para array (caso o Z-API mude o formato)
      if (typeof body === "object" && body !== null) {
        console.log("Convertendo objeto único para array");
        messages = [body as ZApiWebhookMessage];
      } else {
        return NextResponse.json(
          { error: "Payload deve ser um array ou objeto" },
          { status: 400 }
        );
      }
    } else {
      messages = body as ZApiWebhookMessage[];
    }

    // Validar que o array não está vazio
    if (messages.length === 0) {
      console.log("Array vazio recebido");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Processar cada mensagem
    const promises = messages.map((message: ZApiWebhookMessage) =>
      processMessage(message)
    );
    await Promise.all(promises);

    // Sempre retornar 200 OK para o Z-API
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro inesperado no webhook Z-API:", error);
    // Sempre retornar 200 OK mesmo com erros para não quebrar o webhook
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
