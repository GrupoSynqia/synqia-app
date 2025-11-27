
import Link from 'next/link'
import Image from 'next/image'

export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary border-secondary px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <Image
                        src="/LogoFullWhite.png"
                        alt="Logo"
                        width={200}
                        height={200}
                        className="mb-6"
                    />
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                            Erro na confirmação
                        </h2>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Não foi possível confirmar seu email. O link pode ter expirado.
                        </p>
                    </div>
                </div>

                <div className="bg-card text-card-foreground shadow sm:rounded-lg p-6">
                    <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
                    <p className="text-sm text-destructive">
                        Por favor, tente reenviar o e-mail de confirmação ou entre em contato com o suporte.
                    </p>
                    </div>

                    <div className="flex flex-col gap-3 mt-6">
                        <Link
                            href="/auth/resend-verification-email"
                            className="flex w-full justify-center rounded-md border border-border bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                            Não encontrei o e-mail de confirmação.
                        </Link>
                        <Link
                            href="mailto:suporte@veritas.com.br"
                            className="flex w-full justify-center rounded-md border border-border bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80"
                        >
                            Entrar em contato com o suporte
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}