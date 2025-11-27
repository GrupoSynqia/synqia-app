import { resetPassword } from "@/actions/authentication/reset-password";
import Link from "next/link";
import { ToastHandler } from "../sign-in/_components/toast-handler";
import Image from "next/image";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <ToastHandler error={params.error} />
      {params.success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-md bg-primary/10 p-4 max-w-md border border-primary/20">
          <p className="text-sm text-primary">
            E-mail de redefinição de senha enviado! Verifique sua caixa de
            entrada.
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
              Esqueceu sua senha?
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>
          <div className="text-card-foreground border-transparent p-6">
            <form className="space-y-6" action={resetPassword}>
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
                  className="relative block w-full rounded-md border-0 px-3 py-2 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6 bg-input"
                  placeholder="Email"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer"
                >
                  Enviar link de redefinição
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
