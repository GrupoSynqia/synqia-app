'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function resendVerificationEmail(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        }
    })

    if (error) {
        redirect(`/auth/sign-up?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/auth/sign-up?resend=true')
}