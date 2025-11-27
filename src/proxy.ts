// src/proxy.ts
import { NextResponse, type NextRequest } from 'next/server'
// Importe o novo cliente do Edge
import { createProxyClient } from '@/lib/supabase/proxy'

export async function proxy(req: NextRequest) {
    // 1. O objeto 'res' é onde os cookies sincronizados serão injetados.
    const res = NextResponse.next()

    // 2. Cria o cliente Supabase compatível com o Proxy
    const supabase = createProxyClient(req, res)

    // 3. CRUCIAL: Essa chamada LÊ a sessão e, se necessário, SINCRONIZA/ATUALIZA 
    // os cookies de autenticação na resposta ('res').
    // A documentação do Supabase sugere usar getUser() no Proxy para 
    // garantir que o token seja lido e renovado (refresh) de forma segura.
    const { data: { user } } = await supabase.auth.getUser()

    // O restante da sua lógica de roteamento está OK:
    const url = req.nextUrl.clone()
    const isAuthRoute = url.pathname.startsWith('/auth/sign-in') || url.pathname.startsWith('/auth/sign-up')
    const isProtectedRoute = url.pathname.startsWith('/dashboard')

    if (isAuthRoute && user) {
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    if (isProtectedRoute && !user) {
        url.pathname = '/auth/sign-in'
        return NextResponse.redirect(url)
    }

    // 4. Se não houve redirecionamento, retorne o 'res' para aplicar os cookies
    // atualizados/sincronizados no navegador.
    return res
}

export const config = {
    matcher: ['/', '/auth/sign-in', '/auth/sign-up', '/dashboard/:path*'],
}