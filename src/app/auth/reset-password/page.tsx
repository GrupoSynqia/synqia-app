import { updatePassword } from "@/actions/authentication/update-password";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ToastHandler } from "../sign-in/_components/toast-handler";
import Image from "next/image";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Verificar se o usuário tem uma sessão válida (após clicar no link do email)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/auth/forgot-password?error=" +
        encodeURIComponent("Link inválido ou expirado. Solicite um novo link.")
    );
  }

  return (
    <>
      <ToastHandler error={params.error} />
      <div className="flex min-h-screen items-center justify-center bg-secondary border-secondary px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center">
            <Image
              src="/LogoVerticalWhite.png"
              alt="Logo"
              width={200}
              height={200}
              className="mb-6"
            />
            <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
              Redefinir senha
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Digite sua nova senha abaixo.
            </p>
          </div>
          <div className="text-card-foreground border-transparent p-6">
            <form className="space-y-6" action={updatePassword}>
              <div className="-space-y-px rounded-md shadow-sm">
                <div>
                  <label htmlFor="password" className="sr-only">
                    Nova senha
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="relative block w-full rounded-t-md border-0 px-3 py-2 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6 bg-input"
                    placeholder="Nova senha"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirmar senha
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="relative block w-full rounded-b-md border-0 px-3 py-2 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6 bg-input"
                    placeholder="Confirmar nova senha"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer"
                >
                  Atualizar senha
                </button>
              </div>

              <div className="text-center text-sm">
                <Link
                  href="/auth/sign-in"
                  className="font-medium text-primary hover:text-primary/80 cursor-pointer"
                >
                  Voltar para login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
