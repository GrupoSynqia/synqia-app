'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUp(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    // Especificar a URL de callback para onde o usuário será redirecionado após confirmar o email
    const { error } = await supabase.auth.signUp({
        ...data,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        }
    })

    if (error) {
        redirect(`/auth/sign-up?error=${encodeURIComponent(error.message)}`)
    }

    // Redirecionar de volta para sign-up com mensagem de sucesso
    revalidatePath('/', 'layout')
    redirect('/auth/sign-up?success=true')
}