import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { TopBar } from "./_components/topbar";
import { getUserProfile } from "@/lib/queries/user-data";

export default async function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Buscar perfil primeiro (necessário para validação)
  const profile = await getUserProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-none">
        <AppSidebar />
      </Sidebar>

      <SidebarInset className="bg-primary-foreground flex flex-col p-2">
        <TopBar userName={profile.name} userEmail={user.email || ""} />
        <div className="bg-secondary border-secondary flex-1 overflow-auto rounded-lg border shadow-md">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
