import { getProject } from "@/actions/projects/get-project";
import { getBot } from "@/actions/whatsapp/bot/get-bot";
import { getTriggers } from "@/actions/whatsapp/triggers/get-triggers";
import { getResponses } from "@/actions/whatsapp/responses/get-responses";
import { TriggersListClient } from "./_components/triggers-list-client";
import { notFound } from "next/navigation";

export default async function TriggersPage({
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
  if (!botResult.success || !botResult.data) {
    return (
      <div className="p-6">
        <p className="text-destructive">
          Bot não configurado. Configure o bot primeiro.
        </p>
      </div>
    );
  }

  const triggersResult = await getTriggers(botResult.data.id);
  const responsesResult = await getResponses(botResult.data.id);

  return (
    <TriggersListClient
      projectId={id}
      botId={botResult.data.id}
      triggers={triggersResult.success ? triggersResult.data || [] : []}
      responses={responsesResult.success ? responsesResult.data || [] : []}
    />
  );
}

