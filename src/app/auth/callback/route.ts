import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserProfile } from '@/lib/queries/user-data'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            // Se for reset de senha, redireciona para a página de reset
            if (type === 'recovery') {
                const redirectUrl = isLocalEnv 
                    ? `${origin}/auth/reset-password`
                    : forwardedHost 
                        ? `https://${forwardedHost}/auth/reset-password`
                        : `${origin}/auth/reset-password`
                return NextResponse.redirect(redirectUrl)
            }

            // Se for confirmação de email (signup), verificar se o perfil está completo
            if (type === 'signup') {
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (user) {
                    const profile = await getUserProfile(user.id)

                    // Se o perfil não existe, redirecionar para onboarding
                    if (!profile) {
                        const redirectUrl = isLocalEnv 
                            ? `${origin}/onboarding`
                            : forwardedHost 
                                ? `https://${forwardedHost}/onboarding`
                                : `${origin}/onboarding`
                        return NextResponse.redirect(redirectUrl)
                    }
                }
            }

            // Função auxiliar para construir URL de redirecionamento
            const buildRedirectUrl = (path: string) => {
                if (isLocalEnv) {
                    return `${origin}${path}`
                } else if (forwardedHost) {
                    return `https://${forwardedHost}${path}`
                } else {
                    return `${origin}${path}`
                }
            }

            return NextResponse.redirect(buildRedirectUrl(next))
        }
    }

    // Se houver erro, redireciona para página de erro
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}