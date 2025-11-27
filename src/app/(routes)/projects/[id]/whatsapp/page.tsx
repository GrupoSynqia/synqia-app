import { getProject } from "@/actions/projects/get-project";
import { getBot } from "@/actions/whatsapp/bot/get-bot";
import { BotConfigClient } from "./_components/bot-config-client";
import { notFound } from "next/navigation";

export default async function WhatsAppConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const projectResult = await getProject(id);
  if (!projectResult.success || !projectResult.data) {
    notFound();
  }

  const botResult = await getBot(id);
  if (!botResult.success) {
    return (
      <div className="p-6">
        <p className="text-destructive">
          Erro ao carregar bot: {botResult.error}
        </p>
      </div>
    );
  }

  return (
    <BotConfigClient
      projectId={id}
      projectName={projectResult.data.name}
      bot={botResult.data || null}
    />
  );
}
