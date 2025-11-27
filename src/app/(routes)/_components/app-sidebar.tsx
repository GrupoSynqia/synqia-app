"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="bg-primary-foreground flex items-center gap-2 p-4">
        <Image
          src="/LogoVerticalWhite.png"
          alt="Logo"
          width={150}
          height={150}
        />
      </SidebarHeader>

      <SidebarContent className="bg-primary-foreground">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <span className="text-sm font-semibold text-foreground">
                      Dashboard
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname?.startsWith("/projects") || false}>
                  <Link href="/projects">
                    <span className="text-sm font-semibold text-foreground">
                      Projetos
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
