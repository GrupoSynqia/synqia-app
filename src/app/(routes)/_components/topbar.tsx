"use client";

import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Monitor, Sun, Moon, User, Building2 } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/actions/authentication/sign-out";

type TopBarProps = {
  userName: string;
  userEmail: string;
};

export function TopBar({ userName, userEmail }: TopBarProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-primary-foreground flex w-full h-14 items-center">
      <div className="flex-1 text-lg font-normal">Olá, {userName}!</div>
      <div className="flex items-center justify-end px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="w-8 h-8 border border-primary hover:border-primary/80 transition-all cursor-pointer hover:scale-105 p-5">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64"
            side="bottom"
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-md font-semibold leading-none">{userName}</p>
                <p className="text-xs font-light leading-none">{userEmail}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="font-normal">
              Configurações
            </DropdownMenuLabel>
            <DropdownMenuItem asChild className="text-primary cursor-pointer">
              <Link href="/settings/account">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Perfil</span>
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-primary cursor-pointer">
              <Link href="/settings/enterprise">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Empresa</span>
                </span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="font-normal">
              Preferências
            </DropdownMenuLabel>
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-foreground text-sm">Tema</span>
              <div className="flex items-center gap-1 rounded-md border p-1">
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`rounded p-2 transition-colors ${
                    theme === "system" || !theme
                      ? "bg-primary"
                      : "hover:bg-accent text-primary"
                  }`}
                  aria-label="System theme"
                >
                  <Monitor
                    className={`${
                      theme === "system" || !theme
                        ? "text-primary-foreground"
                        : "text-primary"
                    } h-4 w-4`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`rounded p-1.5 transition-colors ${
                    theme === "light" ? "bg-primary" : "hover:bg-accent"
                  }`}
                  aria-label="Light theme"
                >
                  <Sun
                    className={`${
                      theme === "light"
                        ? "text-primary-foreground"
                        : "text-primary"
                    } h-4 w-4`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`rounded p-1.5 transition-colors ${
                    theme === "dark" ? "bg-primary" : "hover:bg-accent"
                  }`}
                  aria-label="Dark theme"
                >
                  <Moon
                    className={`${
                      theme === "dark"
                        ? "text-primary-foreground"
                        : "text-primary"
                    } h-4 w-4`}
                  />
                </button>
              </div>
            </div>

            <DropdownMenuSeparator />
            <form action={signOut}>
              <DropdownMenuItem
                asChild
                variant="destructive"
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <button type="submit" className="w-full flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
