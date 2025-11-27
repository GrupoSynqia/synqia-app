"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createResponse } from "@/actions/whatsapp/responses/create-response";
import { updateResponse } from "@/actions/whatsapp/responses/update-response";
import { deleteResponse } from "@/actions/whatsapp/responses/delete-response";
import { createMenu } from "@/actions/whatsapp/menus/create-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Response = {
  id: string;
  response_text: string | null;
  response_type: string;
  menu_id: string | null;
};

type Menu = {
  id: string;
  title: string;
  description: string | null;
};

type ResponsesListClientProps = {
  projectId: string;
  botId: string;
  responses: Response[];
  menus: Menu[];
};

export function ResponsesListClient({
  projectId,
  botId,
  responses: initialResponses,
  menus: initialMenus,
}: ResponsesListClientProps) {
  const [responses, setResponses] = useState(initialResponses);
  const [menus] = useState(initialMenus);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    response_text: "",
    response_type: "text" as "text" | "menu" | "flow",
    menu_id: "",
    // Menu data (quando criar menu inline)
    menu_title: "",
    menu_description: "",
  });
  const router = useRouter();

  function startEdit(response: Response) {
    setEditingId(response.id);
    setFormData({
      response_text: response.response_text || "",
      response_type: response.response_type as "text" | "menu" | "flow",
      menu_id: response.menu_id || "",
      menu_title: "",
      menu_description: "",
    });
    setShowCreateForm(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setShowCreateForm(false);
    setFormData({
      response_text: "",
      response_type: "text",
      menu_id: "",
      menu_title: "",
      menu_description: "",
    });
  }

  async function handleSubmit() {
    if (formData.response_type === "text" && !formData.response_text) {
      toast.error("Preencha o texto da resposta");
      return;
    }

    if (formData.response_type === "menu") {
      if (!formData.menu_id && (!formData.menu_title || !formData.menu_id)) {
        toast.error("Selecione um menu ou crie um novo");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let menuId = formData.menu_id;

      // Se criar menu inline
      if (formData.response_type === "menu" && !menuId && formData.menu_title) {
        const menuResult = await createMenu({
          bot_id: botId,
          title: formData.menu_title,
          description: formData.menu_description || null,
        });

        if (!menuResult.success || !menuResult.data) {
          toast.error(menuResult.error || "Erro ao criar menu");
          setIsSubmitting(false);
          return;
        }

        menuId = menuResult.data.id;
      }

      let result;
      if (editingId) {
        result = await updateResponse({
          id: editingId,
          response_text:
            formData.response_type === "text" ? formData.response_text : null,
          response_type: formData.response_type,
          menu_id: formData.response_type === "menu" ? menuId : null,
        });
      } else {
        result = await createResponse({
          bot_id: botId,
          response_text:
            formData.response_type === "text" ? formData.response_text : null,
          response_type: formData.response_type,
          menu_id: formData.response_type === "menu" ? menuId : null,
        });
      }

      if (result.success) {
        toast.success(editingId ? "Resposta atualizada!" : "Resposta criada!");
        cancelEdit();
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao salvar resposta");
      }
    } catch {
      toast.error("Erro ao processar resposta");
    }

    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja deletar esta resposta?")) {
      return;
    }

    const result = await deleteResponse({ id });

    if (result.success) {
      toast.success("Resposta deletada!");
      setResponses(responses.filter((r) => r.id !== id));
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao deletar resposta");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Respostas</h1>
          <p className="text-muted-foreground mt-1">
            Configure as respostas do bot
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/projects/${projectId}/whatsapp`}>Voltar</Link>
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Cancelar" : "Nova Resposta"}
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Editar Resposta" : "Nova Resposta"}
            </CardTitle>
            <CardDescription>Configure a resposta do bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tipo de Resposta *</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.response_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    response_type: e.target.value as "text" | "menu" | "flow",
                  })
                }
              >
                <option value="text">Texto</option>
                <option value="menu">Menu</option>
                <option value="flow" disabled>
                  Flow (em breve)
                </option>
              </select>
            </div>

            {formData.response_type === "text" && (
              <div>
                <label className="text-sm font-medium">
                  Texto da Resposta *
                </label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.response_text}
                  onChange={(e) =>
                    setFormData({ ...formData, response_text: e.target.value })
                  }
                  placeholder="Digite a resposta do bot"
                  rows={4}
                />
              </div>
            )}

            {formData.response_type === "menu" && (
              <>
                <div>
                  <label className="text-sm font-medium">Menu Existente</label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    value={formData.menu_id}
                    onChange={(e) =>
                      setFormData({ ...formData, menu_id: e.target.value })
                    }
                  >
                    <option value="">Selecione um menu ou crie um novo</option>
                    {menus.map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">
                    Ou criar novo menu:
                  </p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium">
                        Título do Menu *
                      </label>
                      <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        value={formData.menu_title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            menu_title: e.target.value,
                          })
                        }
                        placeholder="Título do menu"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Descrição do Menu
                      </label>
                      <textarea
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        value={formData.menu_description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            menu_description: e.target.value,
                          })
                        }
                        placeholder="Descrição do menu"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {responses.map((response) => {
          const menu = response.menu_id
            ? menus.find((m) => m.id === response.menu_id)
            : null;
          return (
            <Card key={response.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {response.response_type === "text"
                    ? "Resposta de Texto"
                    : response.response_type === "menu"
                    ? `Menu: ${menu?.title || "N/A"}`
                    : "Resposta"}
                </CardTitle>
                <CardDescription>
                  Tipo: {response.response_type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {response.response_type === "text" && (
                  <p className="text-sm mb-4">{response.response_text}</p>
                )}
                {response.response_type === "menu" && menu && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">{menu.title}</p>
                    {menu.description && (
                      <p className="text-sm text-muted-foreground">
                        {menu.description}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(response)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(response.id)}
                  >
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {responses.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma resposta encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
