"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createTrigger } from "@/actions/whatsapp/triggers/create-trigger";
import { updateTrigger } from "@/actions/whatsapp/triggers/update-trigger";
import { deleteTrigger } from "@/actions/whatsapp/triggers/delete-trigger";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Trigger = {
  id: string;
  trigger_text: string;
  match_type: string;
  priority: number;
  response_id: string;
  is_active: boolean;
};

type Response = {
  id: string;
  response_text: string | null;
  response_type: string;
};

type TriggersListClientProps = {
  projectId: string;
  botId: string;
  triggers: Trigger[];
  responses: Response[];
};

export function TriggersListClient({
  projectId,
  botId,
  triggers: initialTriggers,
  responses,
}: TriggersListClientProps) {
  const [triggers, setTriggers] = useState(initialTriggers);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    trigger_text: "",
    match_type: "exact" as "exact" | "contains" | "starts_with" | "regex",
    priority: 0,
    response_id: "",
    is_active: true,
  });
  const router = useRouter();

  function startEdit(trigger: Trigger) {
    setEditingId(trigger.id);
    setFormData({
      trigger_text: trigger.trigger_text,
      match_type: trigger.match_type as "exact" | "contains" | "starts_with" | "regex",
      priority: trigger.priority,
      response_id: trigger.response_id,
      is_active: trigger.is_active,
    });
    setShowCreateForm(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setShowCreateForm(false);
    setFormData({
      trigger_text: "",
      match_type: "exact",
      priority: 0,
      response_id: "",
      is_active: true,
    });
  }

  async function handleSubmit() {
    if (!formData.trigger_text || !formData.response_id) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    let result;
    if (editingId) {
      result = await updateTrigger({
        id: editingId,
        ...formData,
      });
    } else {
      result = await createTrigger({
        bot_id: botId,
        ...formData,
      });
    }

    if (result.success) {
      toast.success(editingId ? "Trigger atualizado!" : "Trigger criado!");
      cancelEdit();
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao salvar trigger");
    }

    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja deletar este trigger?")) {
      return;
    }

    const result = await deleteTrigger({ id });

    if (result.success) {
      toast.success("Trigger deletado!");
      setTriggers(triggers.filter((t) => t.id !== id));
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao deletar trigger");
    }
  }

  async function handleToggleActive(id: string, currentStatus: boolean) {
    const result = await updateTrigger({
      id,
      is_active: !currentStatus,
    });

    if (result.success) {
      toast.success(`Trigger ${!currentStatus ? "ativado" : "desativado"}!`);
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao atualizar trigger");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gatilhos</h1>
          <p className="text-muted-foreground mt-1">Configure os gatilhos de resposta</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/projects/${projectId}/whatsapp`}>Voltar</Link>
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Cancelar" : "Novo Gatilho"}
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar Gatilho" : "Novo Gatilho"}</CardTitle>
            <CardDescription>Configure o gatilho que dispara uma resposta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Texto do Gatilho *</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.trigger_text}
                onChange={(e) => setFormData({ ...formData, trigger_text: e.target.value })}
                placeholder="Ex: olá, oi, ajuda"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo de Match *</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.match_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    match_type: e.target.value as "exact" | "contains" | "starts_with" | "regex",
                  })
                }
              >
                <option value="exact">Exato</option>
                <option value="contains">Contém</option>
                <option value="starts_with">Começa com</option>
                <option value="regex">Regex</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Prioridade</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                placeholder="0 (menor = maior prioridade)"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Resposta *</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.response_id}
                onChange={(e) => setFormData({ ...formData, response_id: e.target.value })}
              >
                <option value="">Selecione uma resposta</option>
                {responses.map((response) => (
                  <option key={response.id} value={response.id}>
                    {response.response_text || `Resposta ${response.response_type}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Ativo
              </label>
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {triggers.map((trigger) => {
          const response = responses.find((r) => r.id === trigger.response_id);
          return (
            <Card key={trigger.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{trigger.trigger_text}</CardTitle>
                    <CardDescription>
                      {trigger.match_type} - Prioridade: {trigger.priority}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        trigger.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {trigger.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Resposta: {response?.response_text || "N/A"}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(trigger.id, trigger.is_active)}
                  >
                    {trigger.is_active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => startEdit(trigger)}>
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(trigger.id)}
                  >
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {triggers.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum gatilho encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

