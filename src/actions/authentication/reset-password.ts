'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`,
    })

    if (error) {
        redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/auth/forgot-password?success=true')
}

