"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createProject } from "@/actions/projects/create-project";
import { deleteProject } from "@/actions/projects/delete-project";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Project = {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
};

type ProjectsClientProps = {
  projects: Project[];
};

export function ProjectsClient({ projects: initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const router = useRouter();

  async function handleCreate() {
    if (!formData.name || !formData.description) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsCreating(true);
    const result = await createProject(formData);

    if (result.success && result.data) {
      toast.success("Projeto criado com sucesso!");
      setShowCreateForm(false);
      setFormData({ name: "", description: "" });
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao criar projeto");
    }

    setIsCreating(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja deletar este projeto?")) {
      return;
    }

    const result = await deleteProject({ id });

    if (result.success) {
      toast.success("Projeto deletado com sucesso!");
      setProjects(projects.filter((p) => p.id !== id));
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao deletar projeto");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projetos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus projetos</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancelar" : "Novo Projeto"}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Projeto</CardTitle>
            <CardDescription>Preencha os dados do novo projeto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do projeto"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do projeto"
                rows={3}
              />
            </div>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar Projeto"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/projects/${project.id}`}>Ver Detalhes</Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(project.id)}
                >
                  Deletar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum projeto encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

