"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProject } from "@/actions/projects/update-project";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Project = {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
};

type ProjectDetailClientProps = {
  project: Project;
};

export function ProjectDetailClient({ project: initialProject }: ProjectDetailClientProps) {
  const [project, setProject] = useState(initialProject);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
  });
  const router = useRouter();

  async function handleUpdate() {
    if (!formData.name || !formData.description) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    const result = await updateProject({
      id: project.id,
      ...formData,
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
      description: project.description,
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
          <CardDescription>Gerencie as informações básicas do projeto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            {isEditing ? (
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            ) : (
              <p className="mt-1 text-sm">{project.name}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Descrição</label>
            {isEditing ? (
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            ) : (
              <p className="mt-1 text-sm">{project.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

