import { getProject } from "@/actions/projects/get-project";
import { ProjectDetailClient } from "./_components/project-detail-client";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getProject(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ProjectDetailClient project={result.data} />;
}

