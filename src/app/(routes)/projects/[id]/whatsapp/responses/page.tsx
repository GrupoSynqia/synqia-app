import { getProject } from "@/actions/projects/get-project";
import { getBot } from "@/actions/whatsapp/bot/get-bot";
import { getResponses } from "@/actions/whatsapp/responses/get-responses";
import { getMenus } from "@/actions/whatsapp/menus/get-menus";
import { ResponsesListClient } from "./_components/responses-list-client";
import { notFound } from "next/navigation";

export default async function ResponsesPage({
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

  const responsesResult = await getResponses(botResult.data.id);
  const menusResult = await getMenus(botResult.data.id);

  return (
    <ResponsesListClient
      projectId={id}
      botId={botResult.data.id}
      responses={responsesResult.success ? responsesResult.data || [] : []}
      menus={menusResult.success ? menusResult.data || [] : []}
    />
  );
}

