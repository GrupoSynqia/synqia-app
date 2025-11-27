"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createBot } from "@/actions/whatsapp/bot/create-bot";
import { updateBot } from "@/actions/whatsapp/bot/update-bot";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Bot = {
  id: string;
  instance_id: string;
  api_token: string;
  webhook_url: string | null;
  status: string;
} | null;

type BotConfigClientProps = {
  projectId: string;
  projectName: string;
  bot: Bot;
};

export function BotConfigClient({ projectId, projectName, bot: initialBot }: BotConfigClientProps) {
  const [bot, setBot] = useState(initialBot);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    instance_id: bot?.instance_id || "",
    api_token: bot?.api_token || "",
    webhook_url: bot?.webhook_url || "",
    status: bot?.status || "inactive",
  });
  const router = useRouter();

  async function handleSubmit() {
    if (!formData.instance_id || !formData.api_token) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    let result;
    if (bot) {
      result = await updateBot({
        id: bot.id,
        ...formData,
        status: formData.status as "active" | "inactive",
      });
    } else {
      result = await createBot({
        project_id: projectId,
        ...formData,
        status: formData.status as "active" | "inactive",
      });
    }

    if (result.success && result.data) {
      toast.success(bot ? "Bot atualizado com sucesso!" : "Bot criado com sucesso!");
      setBot(result.data);
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao salvar bot");
    }

    setIsSubmitting(false);
  }

  // Construir URL do webhook baseado na URL atual
  const getWebhookUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/webhooks/zapi`;
    }
    return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhooks/zapi`;
  };

  const webhookUrl = getWebhookUrl();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração WhatsApp</h1>
          <p className="text-muted-foreground mt-1">Projeto: {projectName}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/projects/${projectId}`}>Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração do Bot</CardTitle>
          <CardDescription>Configure a integração com o Z-API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Instance ID *</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border rounded-md"
              value={formData.instance_id}
              onChange={(e) => setFormData({ ...formData, instance_id: e.target.value })}
              placeholder="ID da instância Z-API"
            />
          </div>
          <div>
            <label className="text-sm font-medium">API Token *</label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 border rounded-md"
              value={formData.api_token}
              onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
              placeholder="Token da API Z-API"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Webhook URL</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border rounded-md bg-muted"
              value={webhookUrl}
              readOnly
            />
            <p className="text-xs text-muted-foreground mt-1">
              Configure esta URL no painel do Z-API
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="status"
              checked={formData.status === "active"}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, status: checked ? "active" : "inactive" })
              }
            />
            <Label htmlFor="status" className="cursor-pointer">
              Bot ativo
            </Label>
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : bot ? "Atualizar Bot" : "Criar Bot"}
          </Button>
        </CardContent>
      </Card>

      {bot && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Gatilhos</CardTitle>
              <CardDescription>Configure os gatilhos de resposta</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/projects/${projectId}/whatsapp/triggers`}>
                  Gerenciar Gatilhos
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Respostas</CardTitle>
              <CardDescription>Configure as respostas do bot</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/projects/${projectId}/whatsapp/responses`}>
                  Gerenciar Respostas
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

