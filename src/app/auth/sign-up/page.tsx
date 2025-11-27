import { signUp } from "../../../actions/authentication/sign-up";
import Link from "next/link";
import { ToastHandler } from "../sign-in/_components/toast-handler";
import Image from "next/image";
import { Mail } from "lucide-react";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const showSuccess = params.success === "true";

  // Se foi bem-sucedido, mostrar apenas a mensagem de verificação
  if (showSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary border-secondary px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-card text-card-foreground shadow sm:rounded-lg p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {/* Se não tiver lucide-react, use um emoji: 📧 */}
                <Mail className="text-primary h-6 w-6" />
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                Verifique seu email
              </h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Enviamos um link de confirmação para seu email.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Clique no link para ativar sua conta e fazer login.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-border p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-card-foreground">
                  Não recebeu o email? Verifique sua pasta de spam ou{" "}
                  <Link
                    href="/"
                    className="font-medium underline text-primary hover:text-primary/80"
                  >
                    tente novamente
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulário de cadastro normal
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
              Criar uma conta
            </h2>
          </div>
          <div className="text-card-foreground border-transparent p-6">
            <form className="space-y-6" action={signUp}>
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
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="relative block w-full rounded-b-md border-0 px-3 py-2 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6 bg-input"
                    placeholder="Senha (mínimo 6 caracteres)"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Cadastrar
                </button>
              </div>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  Já tem uma conta?{" "}
                </span>
                <Link
                  href="/"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Entrar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
