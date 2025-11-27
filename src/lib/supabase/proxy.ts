import { CookieOptions, createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export function createProxyClient(req: NextRequest, res: NextResponse) {
    // Retorna um cliente configurado para ler cookies da requisição (req) 
    // e setar/atualizar cookies na resposta (res), o que é CRUCIAL para a sincronização.
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // Lendo os cookies da requisição
                get: (name: string) => req.cookies.get(name)?.value,
                // Escrevendo os cookies na resposta (sincronização)
                set: (name: string, value: string, options: CookieOptions) => {
                    res.cookies.set({ name, value, ...options })
                },
                remove: (name: string, options: CookieOptions) => {
                    res.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )
}