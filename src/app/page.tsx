import { signIn } from "@/actions/authentication/sign-in";
import Link from "next/link";
import { ToastHandler } from "@/app/auth/sign-in/_components/toast-handler";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    email?: string;
    passwordUpdated?: string;
  }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <ToastHandler error={params.error} />
      {params.passwordUpdated && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-md bg-primary/10 p-4 max-w-md border border-primary/20">
          <p className="text-sm text-primary">
            Senha atualizada com sucesso! Faça login com sua nova senha.
          </p>
        </div>
      )}
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
              Entrar na sua conta
            </h2>
          </div>
          <div className="text-card-foreground border-transparent p-6">
            <form className="space-y-6" action={signIn}>
              <div className="-space-y-px rounded-md shadow-sm">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="relative block w-full rounded-t-md border-0 px-3 py-2 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6 bg-input"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Senha
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="relative block w-full rounded-b-md border-0 px-3 py-2 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6 bg-input"
                    placeholder="Senha"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer"
                >
                  Entrar
                </button>
              </div>

              <div className="text-center text-sm">
                {params.error === "Email not confirmed" && params.email ? (
                  <Link
                    href="/auth/resend-verification-email"
                    className="flex w-full justify-center rounded-md border border-border bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Não encontrei o e-mail de confirmação.
                  </Link>
                ) : (
                  <>
                    <div className="mb-2">
                      <Link
                        href="/auth/forgot-password"
                        className="font-medium text-primary hover:text-primary/80 cursor-pointer"
                      >
                        Esqueceu sua senha?
                      </Link>
                    </div>
                    <span className="text-muted-foreground">
                      Não tem uma conta?{" "}
                    </span>
                    <Link
                      href="/auth/sign-up"
                      className="font-medium text-primary hover:text-primary/80 cursor-pointer"
                    >
                      Cadastre-se
                    </Link>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
