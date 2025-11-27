import { resendVerificationEmail } from "@/actions/authentication/resend-verification";
import { Shredder } from "lucide-react";
import Image from "next/image";

export default function ResendVerificationEmailPage() {
  return (
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
          <div className="text-center">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-primary/10">
              <Shredder className="text-primary h-8 w-8" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
              Reenviar e-mail de confirmação
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Por favor, insira o e-mail para o qual você deseja reenviar o
              e-mail de confirmação.
            </p>
          </div>
        </div>

        <div className="bg-card text-card-foreground shadow sm:rounded-lg p-6">
          <form className="space-y-6" action={resendVerificationEmail}>
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
                  className="relative block w-full rounded-md border-0 px-3 py-2 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6 bg-input"
                  placeholder="Email"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Reenviar e-mail de confirmação
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
