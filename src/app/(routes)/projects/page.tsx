import { getProjects } from "@/actions/projects/get-projects";
import { ProjectsClient } from "./_components/projects-client";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const result = await getProjects();

  if (!result.success) {
    return (
      <div className="p-6">
        <p className="text-destructive">
          Erro ao carregar projetos: {result.error}
        </p>
      </div>
    );
  }

  return <ProjectsClient projects={result.data || []} />;
}
