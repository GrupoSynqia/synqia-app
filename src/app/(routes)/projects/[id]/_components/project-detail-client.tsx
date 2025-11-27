"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProject } from "@/actions/projects/update-project";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Project = {
  id: string;
  name: string;
  category: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
};

type ProjectDetailClientProps = {
  project: Project;
};

export function ProjectDetailClient({
  project: initialProject,
}: ProjectDetailClientProps) {
  const [project, setProject] = useState(initialProject);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    category: (project.category || "others") as
      | "microsaas"
      | "ecommerce"
      | "crm"
      | "others",
  });
  const router = useRouter();

  async function handleUpdate() {
    if (!formData.name || !formData.category) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    const result = await updateProject({
      id: project.id,
      name: formData.name,
      category: formData.category,
    });

    if (result.success && result.data) {
      toast.success("Projeto atualizado com sucesso!");
      setProject(result.data);
      setIsEditing(false);
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao atualizar projeto");
    }

    setIsSubmitting(false);
  }

  function handleCancel() {
    setFormData({
      name: project.name,
      category: (project.category || "others") as
        | "microsaas"
        | "ecommerce"
        | "crm"
        | "others",
    });
    setIsEditing(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground mt-1">Detalhes do projeto</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleCancel} variant="outline">
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Editar
              </Button>
              <Button asChild>
                <Link href={`/projects/${project.id}/whatsapp`}>
                  Configurar WhatsApp
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            {isEditing ? (
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            ) : (
              <p className="mt-1 text-sm">{project.name}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Categoria</label>
            {isEditing ? (
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as
                      | "microsaas"
                      | "ecommerce"
                      | "crm"
                      | "others",
                  })
                }
              >
                <option value="microsaas">Micro SaaS</option>
                <option value="ecommerce">E-commerce</option>
                <option value="crm">CRM & ERP</option>
                <option value="others">Outros</option>
              </select>
            ) : (
              <p className="mt-1 text-sm">
                {formData.category === "microsaas"
                  ? "Micro SaaS"
                  : formData.category === "ecommerce"
                  ? "E-commerce"
                  : formData.category === "crm"
                  ? "CRM & ERP"
                  : "Outros"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
