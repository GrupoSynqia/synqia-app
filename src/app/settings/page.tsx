import { redirect } from "next/navigation";

export default async function SettingsPage() {
  // Redirecionar para a página de configurações da conta por padrão
  redirect("/settings/account");
}
